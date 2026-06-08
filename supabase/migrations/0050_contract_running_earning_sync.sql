-- Keep campaign status and driver earning eligibility aligned with contract state.
-- A contract can become running through admin buttons or install-proof approval.

create or replace function public.sync_campaign_active_from_running_contract()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'running' then
    update public.campaigns
    set status = 'active'
    where id = new.campaign_id
      and status = 'awaiting_install';
  end if;

  return new;
end;
$$;

drop trigger if exists contracts_sync_campaign_active_on_running on public.contracts;

create trigger contracts_sync_campaign_active_on_running
after insert or update of status on public.contracts
for each row
when (new.status = 'running')
execute function public.sync_campaign_active_from_running_contract();

update public.campaigns c
set status = 'active'
where c.status = 'awaiting_install'
  and exists (
    select 1
    from public.contracts ct
    where ct.campaign_id = c.id
      and ct.status = 'running'
  );

update public.contracts
set earning_start_date = coalesce(earning_start_date, installed_at::date, current_date),
    earning_approved_at = coalesce(earning_approved_at, installed_at, now())
where status in ('running', 'completed')
  and earning_start_date is null;

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

  if contract_row.status not in ('running', 'completed')
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
