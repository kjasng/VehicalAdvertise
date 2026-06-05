-- Fix partner campaign fund flow.
-- Campaign creation atomically reserves partner balance.
-- Garage install payout is fixed at 3.2m VND and credited once per contract.

update public.pricing_rules
set install_fee_vnd = 3200000
where install_fee_vnd <> 3200000;

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
  p_target_districts text[],
  p_monthly_budget_vnd bigint,
  p_driver_net_monthly_vnd bigint,
  p_active_driver_limit int,
  p_requested_driver_count int
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
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
    rate_per_km_vnd,
    start_date,
    end_date,
    target_districts,
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
    0,
    p_start_date,
    p_end_date,
    p_target_districts,
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

  insert into audit_log (actor_id, action, entity_type, entity_id, diff)
  values (
    p_partner_id,
    'campaign_budget_reserved',
    'campaigns',
    inserted_id,
    jsonb_build_object(
      'budget_vnd',
      p_budget_vnd,
      'campaign_id',
      inserted_id,
      'platform_fee_pct',
      10.00
    )
  );

  return inserted_id;
end;
$$;

revoke execute on function public.partner_create_campaign_with_reserve(
  uuid,
  text,
  text,
  text,
  text[],
  text,
  bigint,
  date,
  date,
  text[],
  bigint,
  bigint,
  int,
  int
) from public, anon, authenticated;

grant execute on function public.partner_create_campaign_with_reserve(
  uuid,
  text,
  text,
  text,
  text[],
  text,
  bigint,
  date,
  date,
  text[],
  bigint,
  bigint,
  int,
  int
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
  latest_photo_ids uuid[];
  latest_photo_count int;
  latest_pending_count int;
  install_fee constant bigint := 3200000;
  earning_id uuid;
  payout_ledger_id bigint;
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

  with latest as (
    select id, status
    from photos
    where subject_id = proof.subject_id
      and subject_type = 'contract'
      and kind = 'install_proof'
    order by created_at desc
    limit 4
    for update
  )
  select coalesce(array_agg(id), '{}'), count(*), count(*) filter (where status = 'pending')
  into latest_photo_ids, latest_photo_count, latest_pending_count
  from latest;

  if latest_photo_count <> 4 then
    raise exception 'admin_review_install_proof: install proof requires exactly 4 latest photos';
  end if;

  if not p_photo_id = any(latest_photo_ids) then
    raise exception 'admin_review_install_proof: selected photo is not in latest install proof batch';
  end if;

  if latest_pending_count <> 4 then
    raise exception 'admin_review_install_proof: install proof batch already reviewed';
  end if;

  update photos
  set status = p_decision,
      reviewed_by = p_actor_id,
      reviewed_at = now(),
      reject_reason = case when p_decision = 'rejected' then p_reason else null end
  where id = any(latest_photo_ids);

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

    insert into ledger_entries (kind, contract_id, amount_vnd, ref_type, ref_id, note)
    values (
      'garage_install_payout',
      proof.subject_id,
      install_fee,
      'install_proof',
      p_photo_id::text,
      'Fixed garage install payout for approved proof batch'
    )
    on conflict do nothing
    returning id into payout_ledger_id;
  end if;

  insert into audit_log (actor_id, action, entity_type, entity_id, diff)
  values (
    p_actor_id,
    'install_proof_' || p_decision::text,
    'photos',
    p_photo_id,
    jsonb_build_object(
      'reason',
      p_reason,
      'photo_ids',
      latest_photo_ids,
      'garage_earning_id',
      earning_id,
      'garage_credit_vnd',
      credited_amount,
      'garage_install_payout_ledger_id',
      payout_ledger_id,
      'earning_approved',
      p_decision = 'approved'
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
