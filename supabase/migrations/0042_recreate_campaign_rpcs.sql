-- 0042_recreate_campaign_rpcs.sql
-- Recreate the two money RPCs so they no longer reference campaigns columns
-- being dropped in 0043 (rate_per_km_vnd, target_districts, balance_percent).
-- MUST run before 0043 (plpgsql is late-bound; dropping a referenced column
-- would break these functions at runtime otherwise).

-- 1) partner_create_campaign_with_reserve: drop p_target_districts param;
--    remove rate_per_km_vnd (was hardcoded 0) and target_districts from insert.
--    Signature changes -> drop the old overload first.
drop function if exists public.partner_create_campaign_with_reserve(
  uuid, text, text, text, text[], text, bigint, date, date, text[], bigint, bigint, integer, integer
);

create or replace function public.partner_create_campaign_with_reserve(
  p_partner_id uuid,
  p_name text,
  p_brief text,
  p_creative_url text,
  p_creative_urls text[],
  p_qr_target_url text,
  p_budget_vnd bigint,
  p_start_date date,
  p_end_date date,
  p_monthly_budget_vnd bigint,
  p_driver_net_monthly_vnd bigint,
  p_active_driver_limit integer,
  p_requested_driver_count integer
)
returns uuid
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  current_balance bigint;
  current_status partner_status;
  inserted_id uuid;
begin
  if p_budget_vnd <= 0 or p_monthly_budget_vnd <= 0 then
    raise exception 'partner_create_campaign_with_reserve: budget must be positive';
  end if;

  if p_active_driver_limit <= 0 or p_requested_driver_count <= 0 then
    raise exception 'partner_create_campaign_with_reserve: driver count must be positive';
  end if;

  select balance_vnd, status
  into current_balance, current_status
  from partners
  where id = p_partner_id
  for update;

  if current_balance is null then
    raise exception 'partner_create_campaign_with_reserve: partner not found';
  end if;

  if current_status <> 'approved' then
    raise exception 'partner_create_campaign_with_reserve: partner account is not active';
  end if;

  if current_balance < p_budget_vnd then
    raise exception 'partner_create_campaign_with_reserve: partner balance is insufficient';
  end if;

  insert into campaigns (
    partner_id,
    name,
    brief,
    creative_url,
    creative_urls,
    qr_target_url,
    budget_vnd,
    start_date,
    end_date,
    status,
    funding_mode,
    monthly_budget_vnd,
    driver_net_monthly_vnd,
    platform_fee_pct,
    active_driver_limit,
    requested_driver_count
  )
  values (
    p_partner_id,
    p_name,
    p_brief,
    p_creative_url,
    p_creative_urls,
    p_qr_target_url,
    p_budget_vnd,
    p_start_date,
    p_end_date,
    'submitted',
    'monthly_cap',
    p_monthly_budget_vnd,
    p_driver_net_monthly_vnd,
    10.00,
    p_active_driver_limit,
    p_requested_driver_count
  )
  returning id into inserted_id;

  update partners
  set balance_vnd = balance_vnd - p_budget_vnd
  where id = p_partner_id;

  insert into ledger_entries (kind, partner_id, amount_vnd, ref_type, ref_id, note)
  values (
    'partner_charge',
    p_partner_id,
    -p_budget_vnd,
    'campaign_budget_reserve',
    inserted_id::text,
    'Campaign budget reserved at creation'
  );

  return inserted_id;
end;
$function$;

revoke execute on function public.partner_create_campaign_with_reserve(
  uuid, text, text, text, text[], text, bigint, date, date, bigint, bigint, integer, integer
) from public, anon, authenticated;
grant execute on function public.partner_create_campaign_with_reserve(
  uuid, text, text, text, text[], text, bigint, date, date, bigint, bigint, integer, integer
) to service_role;

-- 2) ensure_driver_monthly_earning_period: drop balance_percent funding branch.
--    monthly_budget always = monthly_budget_vnd (fallback budget_vnd). Same signature.
create or replace function public.ensure_driver_monthly_earning_period(
  p_driver_id uuid,
  p_contract_id uuid,
  p_period_start date,
  p_period_end date
)
returns uuid
language plpgsql
security definer
set search_path to 'public'
as $function$
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
  has_reserved_budget boolean;
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

  select exists (
    select 1
    from ledger_entries
    where kind = 'partner_charge'
      and partner_id = campaign_row.partner_id
      and ref_type = 'campaign_budget_reserve'
      and ref_id = campaign_row.id::text
  )
  into has_reserved_budget;

  driver_net := coalesce(campaign_row.driver_net_monthly_vnd, 1100000);
  fee_pct := coalesce(campaign_row.platform_fee_pct, 10.00);
  gross_charge := ceil(driver_net::numeric / (1 - (fee_pct / 100.0)))::bigint;
  platform_fee := gross_charge - driver_net;

  monthly_budget := coalesce(campaign_row.monthly_budget_vnd, campaign_row.budget_vnd);

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

  if not has_reserved_budget and partner_balance < gross_charge then
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

  if not has_reserved_budget then
    update partners
    set balance_vnd = balance_vnd - gross_charge
    where id = campaign_row.partner_id;

    insert into ledger_entries (
      kind, partner_id, driver_id, contract_id, amount_vnd, ref_type, ref_id, note
    )
    values
      ('partner_charge', campaign_row.partner_id, null, p_contract_id, -gross_charge, 'driver_earning_period', period_id::text, 'Monthly campaign charge for driver earning'),
      ('platform_fee', campaign_row.partner_id, null, p_contract_id, platform_fee, 'driver_earning_period', period_id::text, 'Platform fee from monthly driver earning');
  end if;

  update campaigns
  set spent_vnd = spent_vnd + gross_charge
  where id = campaign_row.id;

  insert into ledger_entries (kind, partner_id, driver_id, contract_id, amount_vnd, ref_type, ref_id, note)
  values ('driver_accrual', null, p_driver_id, p_contract_id, driver_net, 'driver_earning_period', period_id::text, 'Monthly driver earning accrual')
  on conflict do nothing;

  return period_id;
end;
$function$;
