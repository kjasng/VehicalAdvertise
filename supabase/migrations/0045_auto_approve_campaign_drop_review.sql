-- 0045_auto_approve_campaign_drop_review.sql
-- Standalone admin creative-review removed: partners now upload the creative as
-- part of campaign creation, so there is no separate review step. Campaigns are
-- auto-approved on publish — partner_create_campaign_with_reserve now inserts
-- status 'approved' (was 'submitted'), which the admin contracts / driver-
-- assignment flow already consumes. The approve_campaign review RPC is dropped.

-- 1) Recreate the create-campaign RPC with status 'approved' (only change vs 0042).
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
    'approved',
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

-- 2) Drop the now-unused campaign creative-review RPC.
drop function if exists public.approve_campaign(uuid, public.campaign_status, text);
