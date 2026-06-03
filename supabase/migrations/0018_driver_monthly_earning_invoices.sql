-- Driver monthly earning and withdrawal invoices.
-- Current scope intentionally skips GPS/km tracking. Earning is monthly and
-- starts only after admin approves garage decal installation proof.

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public'
      and t.typname = 'driver_invoice_status'
  ) then
    create type public.driver_invoice_status as enum (
      'requested',
      'reviewing',
      'approved',
      'paid',
      'rejected'
    );
  end if;
end;
$$;

alter table public.drivers
  add column if not exists bank_name text,
  add column if not exists bank_branch text,
  add column if not exists bank_verified_at timestamptz,
  add column if not exists operating_districts text[];

alter table public.campaigns
  add column if not exists funding_mode text not null default 'monthly_cap'
    check (funding_mode in ('monthly_cap', 'balance_percent')),
  add column if not exists monthly_budget_vnd bigint,
  add column if not exists balance_percent numeric(5,2),
  add column if not exists driver_net_monthly_vnd bigint not null default 1100000
    check (driver_net_monthly_vnd > 0),
  add column if not exists platform_fee_pct numeric(5,2) not null default 20.00
    check (platform_fee_pct >= 0 and platform_fee_pct < 100),
  add column if not exists active_driver_limit int
    check (active_driver_limit is null or active_driver_limit > 0);

alter table public.contracts
  add column if not exists earning_start_date date,
  add column if not exists earning_approved_at timestamptz,
  add column if not exists earning_approved_by uuid references public.profiles(id),
  add column if not exists garage_selected_at timestamptz,
  add column if not exists install_note text;

create table if not exists public.driver_earning_periods (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references public.contracts(id) on delete cascade,
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  driver_id uuid not null references public.drivers(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  gross_charge_vnd bigint not null check (gross_charge_vnd > 0),
  platform_fee_vnd bigint not null check (platform_fee_vnd >= 0),
  driver_net_vnd bigint not null check (driver_net_vnd > 0),
  status text not null default 'accrued'
    check (status in ('accrued', 'invoiced', 'paid', 'void')),
  created_at timestamptz not null default now(),
  unique (contract_id, period_start)
);

create index if not exists driver_earning_periods_driver_idx
  on public.driver_earning_periods (driver_id, period_start desc);

create index if not exists driver_earning_periods_campaign_period_idx
  on public.driver_earning_periods (campaign_id, period_start);

create table if not exists public.driver_invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text not null unique,
  driver_id uuid not null references public.drivers(id) on delete cascade,
  contract_id uuid not null references public.contracts(id) on delete cascade,
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  earning_period_id uuid not null references public.driver_earning_periods(id) on delete restrict,
  period_start date not null,
  period_end date not null,
  amount_vnd bigint not null check (amount_vnd > 0),
  status public.driver_invoice_status not null default 'requested',
  bank_snapshot jsonb not null default '{}'::jsonb,
  invoice_html text not null,
  requested_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  paid_at timestamptz,
  reject_reason text,
  payout_id uuid references public.payouts(id),
  unique (contract_id, period_start)
);

create index if not exists driver_invoices_driver_idx
  on public.driver_invoices (driver_id, requested_at desc);

create index if not exists driver_invoices_status_idx
  on public.driver_invoices (status, requested_at desc);

alter table public.driver_invoices
  add column if not exists created_at timestamptz not null default now();

create unique index if not exists ledger_driver_earning_period_kind_ref_uidx
  on public.ledger_entries (kind, ref_type, ref_id)
  where ref_type = 'driver_earning_period' and ref_id is not null;

alter table public.driver_earning_periods enable row level security;
alter table public.driver_invoices enable row level security;

drop policy if exists driver_earning_periods_driver_read on public.driver_earning_periods;
create policy driver_earning_periods_driver_read
  on public.driver_earning_periods
  for select
  using (driver_id = auth.uid());

drop policy if exists driver_earning_periods_admin_all on public.driver_earning_periods;
create policy driver_earning_periods_admin_all
  on public.driver_earning_periods
  for all
  using (is_admin());

drop policy if exists driver_invoices_driver_read on public.driver_invoices;
create policy driver_invoices_driver_read
  on public.driver_invoices
  for select
  using (driver_id = auth.uid());

drop policy if exists driver_invoices_admin_all on public.driver_invoices;
create policy driver_invoices_admin_all
  on public.driver_invoices
  for all
  using (is_admin());

create or replace function public.ensure_driver_monthly_earning_period(
  p_driver_id uuid,
  p_contract_id uuid,
  p_period_start date,
  p_period_end date
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  period_id uuid;
  contract_row contracts%rowtype;
  campaign_row campaigns%rowtype;
  partner_balance bigint;
  monthly_budget bigint;
  existing_campaign_gross bigint;
  driver_net bigint;
  fee_pct numeric(5,2);
  gross_charge bigint;
  platform_fee bigint;
  period_driver_count int;
begin
  if p_period_end <= p_period_start then
    raise exception 'ensure_driver_monthly_earning_period: invalid period';
  end if;

  select id
  into period_id
  from driver_earning_periods
  where contract_id = p_contract_id
    and period_start = p_period_start;

  if period_id is not null then
    return period_id;
  end if;

  select *
  into contract_row
  from contracts
  where id = p_contract_id
    and driver_id = p_driver_id
  for update;

  if contract_row.id is null then
    raise exception 'ensure_driver_monthly_earning_period: contract not found';
  end if;

  if contract_row.status <> 'running'
    or contract_row.earning_start_date is null
    or p_period_start < contract_row.earning_start_date then
    raise exception 'ensure_driver_monthly_earning_period: contract is not earning-active';
  end if;

  select *
  into campaign_row
  from campaigns
  where id = contract_row.campaign_id
  for update;

  if campaign_row.id is null then
    raise exception 'ensure_driver_monthly_earning_period: campaign not found';
  end if;

  select balance_vnd
  into partner_balance
  from partners
  where id = campaign_row.partner_id
  for update;

  if partner_balance is null then
    raise exception 'ensure_driver_monthly_earning_period: partner not found';
  end if;

  driver_net := coalesce(campaign_row.driver_net_monthly_vnd, 1100000);
  fee_pct := coalesce(campaign_row.platform_fee_pct, 20.00);
  gross_charge := ceil(driver_net::numeric / (1 - (fee_pct / 100.0)))::bigint;
  platform_fee := gross_charge - driver_net;

  if campaign_row.funding_mode = 'balance_percent' then
    monthly_budget := floor(partner_balance::numeric * coalesce(campaign_row.balance_percent, 0) / 100.0)::bigint;
  else
    monthly_budget := coalesce(campaign_row.monthly_budget_vnd, campaign_row.budget_vnd);
  end if;

  select coalesce(sum(gross_charge_vnd), 0)
  into existing_campaign_gross
  from driver_earning_periods
  where campaign_id = campaign_row.id
    and period_start = p_period_start
    and status <> 'void';

  if campaign_row.active_driver_limit is not null then
    select count(distinct driver_id)
    into period_driver_count
    from driver_earning_periods
    where campaign_id = campaign_row.id
      and period_start = p_period_start
      and status <> 'void';

    if period_driver_count >= campaign_row.active_driver_limit then
      raise exception 'ensure_driver_monthly_earning_period: active driver limit reached';
    end if;
  end if;

  if monthly_budget <= 0 or existing_campaign_gross + gross_charge > monthly_budget then
    raise exception 'ensure_driver_monthly_earning_period: campaign monthly budget is insufficient';
  end if;

  if campaign_row.spent_vnd + gross_charge > campaign_row.budget_vnd then
    raise exception 'ensure_driver_monthly_earning_period: campaign total budget is insufficient';
  end if;

  if partner_balance < gross_charge then
    raise exception 'ensure_driver_monthly_earning_period: partner balance is insufficient';
  end if;

  insert into driver_earning_periods (
    contract_id,
    campaign_id,
    driver_id,
    period_start,
    period_end,
    gross_charge_vnd,
    platform_fee_vnd,
    driver_net_vnd
  )
  values (
    p_contract_id,
    campaign_row.id,
    p_driver_id,
    p_period_start,
    p_period_end,
    gross_charge,
    platform_fee,
    driver_net
  )
  returning id into period_id;

  update partners
  set balance_vnd = balance_vnd - gross_charge
  where id = campaign_row.partner_id;

  update campaigns
  set spent_vnd = spent_vnd + gross_charge
  where id = campaign_row.id;

  insert into ledger_entries (kind, partner_id, driver_id, contract_id, amount_vnd, ref_type, ref_id, note)
  values
    ('partner_charge', campaign_row.partner_id, null, p_contract_id, -gross_charge, 'driver_earning_period', period_id::text, 'Monthly campaign charge for driver earning'),
    ('platform_fee', campaign_row.partner_id, null, p_contract_id, platform_fee, 'driver_earning_period', period_id::text, 'Platform fee from monthly driver earning'),
    ('driver_accrual', null, p_driver_id, p_contract_id, driver_net, 'driver_earning_period', period_id::text, 'Monthly driver earning accrual')
  on conflict do nothing;

  return period_id;
end;
$$;

revoke execute on function public.ensure_driver_monthly_earning_period(
  uuid,
  uuid,
  date,
  date
) from public, anon, authenticated;

grant execute on function public.ensure_driver_monthly_earning_period(
  uuid,
  uuid,
  date,
  date
) to service_role;

create or replace function public.admin_review_install_proof(
  p_actor_id uuid,
  p_photo_id uuid,
  p_decision photo_status,
  p_reason text default null
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  proof photos%rowtype;
  proof_contract contracts%rowtype;
  install_fee bigint;
  payout_ledger_id bigint;
begin
  if p_decision not in ('approved', 'rejected') then
    raise exception 'admin_review_install_proof: invalid decision %', p_decision;
  end if;

  if p_decision = 'rejected' and nullif(trim(coalesce(p_reason, '')), '') is null then
    raise exception 'admin_review_install_proof: rejection reason required';
  end if;

  if not exists (
    select 1 from profiles
    where id = p_actor_id
      and role = 'admin'
      and blocked = false
  ) then
    raise exception 'admin_review_install_proof: active admin only';
  end if;

  select *
  into proof
  from photos
  where id = p_photo_id
  for update;

  if proof.id is null then
    raise exception 'admin_review_install_proof: install proof % not found', p_photo_id;
  end if;

  if proof.kind <> 'install_proof' or proof.subject_type <> 'contract' then
    raise exception 'admin_review_install_proof: photo % is not an install proof', p_photo_id;
  end if;

  if proof.status <> 'pending' then
    raise exception 'admin_review_install_proof: install proof already reviewed';
  end if;

  update photos
  set status = p_decision,
      reviewed_by = p_actor_id,
      reviewed_at = now(),
      reject_reason = case when p_decision = 'rejected' then p_reason else null end
  where id = p_photo_id;

  if p_decision = 'approved' then
    select *
    into proof_contract
    from contracts
    where id = proof.subject_id
    for update;

    if proof_contract.id is null then
      raise exception 'admin_review_install_proof: contract % not found', proof.subject_id;
    end if;

    if proof_contract.install_garage_id is null then
      raise exception 'admin_review_install_proof: contract % has no install garage', proof.subject_id;
    end if;

    update contracts
    set status = 'running',
        installed_at = coalesce(installed_at, now()),
        earning_start_date = coalesce(earning_start_date, current_date),
        earning_approved_at = coalesce(earning_approved_at, now()),
        earning_approved_by = coalesce(earning_approved_by, p_actor_id)
    where id = proof.subject_id;

    select coalesce(install_fee_vnd, 0)
    into install_fee
    from pricing_rules
    where effective_from <= current_date
    order by effective_from desc, created_at desc
    limit 1;

    if coalesce(install_fee, 0) > 0 then
      insert into ledger_entries (kind, contract_id, amount_vnd, ref_type, ref_id, note)
      values (
        'garage_install_payout',
        proof.subject_id,
        install_fee,
        'install_proof',
        p_photo_id::text,
        'Garage install payout for approved proof'
      )
      on conflict do nothing
      returning id into payout_ledger_id;

      if payout_ledger_id is null then
        select id
        into payout_ledger_id
        from ledger_entries
        where ref_type = 'install_proof'
          and ref_id = p_photo_id::text
        limit 1;
      end if;
    end if;
  end if;

  insert into audit_log (actor_id, action, entity_type, entity_id, diff)
  values (
    p_actor_id,
    'install_proof_' || p_decision::text,
    'photos',
    p_photo_id,
    jsonb_build_object(
      'reason', p_reason,
      'garage_install_payout_ledger_id', payout_ledger_id,
      'earning_approved', p_decision = 'approved'
    )
  );

  return coalesce(payout_ledger_id, 0);
end;
$$;

revoke execute on function public.admin_review_install_proof(
  uuid,
  uuid,
  photo_status,
  text
) from public, anon, authenticated;

grant execute on function public.admin_review_install_proof(
  uuid,
  uuid,
  photo_status,
  text
) to service_role;
