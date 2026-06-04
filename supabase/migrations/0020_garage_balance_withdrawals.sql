-- Garage real-money flow.
-- Approved install proofs credit garage balance directly from pricing_rules,
-- and garages can request immediate withdrawals once the minimum is reached.

alter table public.pricing_rules
  add column if not exists garage_minimum_withdrawal_vnd bigint not null default 2000000
    check (garage_minimum_withdrawal_vnd >= 0);

alter table public.garages
  add column if not exists contact_name text,
  add column if not exists phone text,
  add column if not exists service_area text,
  add column if not exists google_maps_url text,
  add column if not exists working_hours text,
  add column if not exists bank_account_name text,
  add column if not exists bank_account_number text,
  add column if not exists bank_name text,
  add column if not exists bank_branch text,
  add column if not exists bank_bin text,
  add column if not exists bank_verified_at timestamptz,
  add column if not exists balance_vnd bigint not null default 0
    check (balance_vnd >= 0);

revoke update (approved, balance_vnd, bank_verified_at) on public.garages from anon, authenticated;

create table if not exists public.garage_earnings (
  id uuid primary key default gen_random_uuid(),
  garage_id uuid not null references public.garages(id) on delete cascade,
  contract_id uuid not null references public.contracts(id) on delete cascade,
  photo_id uuid references public.photos(id) on delete set null,
  amount_vnd bigint not null check (amount_vnd > 0),
  source text not null default 'install_approval'
    check (source in ('install_approval')),
  approved_by uuid references public.profiles(id),
  approved_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (contract_id)
);

create index if not exists garage_earnings_garage_created_idx
  on public.garage_earnings (garage_id, created_at desc);

create table if not exists public.garage_withdrawals (
  id uuid primary key default gen_random_uuid(),
  withdrawal_number text not null unique,
  garage_id uuid not null references public.garages(id) on delete cascade,
  amount_vnd bigint not null check (amount_vnd > 0),
  status public.payout_status not null default 'processing',
  bank_snapshot jsonb not null default '{}'::jsonb,
  invoice_html text not null,
  requested_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  failure_reason text
);

create index if not exists garage_withdrawals_garage_requested_idx
  on public.garage_withdrawals (garage_id, requested_at desc);

create index if not exists garage_withdrawals_status_requested_idx
  on public.garage_withdrawals (status, requested_at desc);

alter table public.garage_earnings enable row level security;
alter table public.garage_withdrawals enable row level security;

drop policy if exists garage_earnings_garage_read on public.garage_earnings;
create policy garage_earnings_garage_read
  on public.garage_earnings
  for select
  using (garage_id = auth.uid());

drop policy if exists garage_earnings_admin_all on public.garage_earnings;
create policy garage_earnings_admin_all
  on public.garage_earnings
  for all
  using (is_admin());

drop policy if exists garage_withdrawals_garage_read on public.garage_withdrawals;
create policy garage_withdrawals_garage_read
  on public.garage_withdrawals
  for select
  using (garage_id = auth.uid());

drop policy if exists garage_withdrawals_admin_all on public.garage_withdrawals;
create policy garage_withdrawals_admin_all
  on public.garage_withdrawals
  for all
  using (is_admin());

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
  earning_id uuid;
  credited_amount bigint := 0;
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
      insert into garage_earnings (
        garage_id,
        contract_id,
        photo_id,
        amount_vnd,
        approved_by
      )
      values (
        proof_contract.install_garage_id,
        proof.subject_id,
        p_photo_id,
        install_fee,
        p_actor_id
      )
      on conflict (contract_id) do nothing
      returning id into earning_id;

      if earning_id is not null then
        update garages
        set balance_vnd = balance_vnd + install_fee
        where id = proof_contract.install_garage_id;
        credited_amount := install_fee;
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
      'garage_earning_id', earning_id,
      'garage_credit_vnd', credited_amount,
      'earning_approved', p_decision = 'approved'
    )
  );

  return credited_amount;
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

create or replace function public.request_garage_withdrawal(
  p_garage_id uuid,
  p_withdrawal_number text,
  p_amount_vnd bigint,
  p_bank_snapshot jsonb,
  p_invoice_html text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  garage_row garages%rowtype;
  minimum_withdrawal bigint;
  withdrawal_id uuid;
begin
  if p_amount_vnd <= 0 then
    raise exception 'request_garage_withdrawal: amount must be positive';
  end if;

  select *
  into garage_row
  from garages
  where id = p_garage_id
  for update;

  if garage_row.id is null then
    raise exception 'request_garage_withdrawal: garage not found';
  end if;

  if garage_row.approved is not true then
    raise exception 'request_garage_withdrawal: garage is not approved';
  end if;

  if nullif(trim(coalesce(garage_row.bank_account_name, '')), '') is null
    or nullif(trim(coalesce(garage_row.bank_account_number, '')), '') is null
    or nullif(trim(coalesce(garage_row.bank_name, '')), '') is null then
    raise exception 'request_garage_withdrawal: payout settings incomplete';
  end if;

  select coalesce(garage_minimum_withdrawal_vnd, 2000000)
  into minimum_withdrawal
  from pricing_rules
  where effective_from <= current_date
  order by effective_from desc, created_at desc
  limit 1;

  minimum_withdrawal := coalesce(minimum_withdrawal, 2000000);

  if p_amount_vnd < minimum_withdrawal then
    raise exception 'request_garage_withdrawal: minimum withdrawal is %', minimum_withdrawal;
  end if;

  if garage_row.balance_vnd < p_amount_vnd then
    raise exception 'request_garage_withdrawal: insufficient balance';
  end if;

  update garages
  set balance_vnd = balance_vnd - p_amount_vnd
  where id = p_garage_id;

  insert into garage_withdrawals (
    withdrawal_number,
    garage_id,
    amount_vnd,
    status,
    bank_snapshot,
    invoice_html
  )
  values (
    p_withdrawal_number,
    p_garage_id,
    p_amount_vnd,
    'processing',
    p_bank_snapshot,
    p_invoice_html
  )
  returning id into withdrawal_id;

  insert into audit_log (actor_id, action, entity_type, entity_id, diff)
  values (
    p_garage_id,
    'garage_withdrawal_requested',
    'garage_withdrawals',
    withdrawal_id,
    jsonb_build_object('amount_vnd', p_amount_vnd)
  );

  return withdrawal_id;
end;
$$;

revoke execute on function public.request_garage_withdrawal(
  uuid,
  text,
  bigint,
  jsonb,
  text
) from public, anon, authenticated;

grant execute on function public.request_garage_withdrawal(
  uuid,
  text,
  bigint,
  jsonb,
  text
) to service_role;
