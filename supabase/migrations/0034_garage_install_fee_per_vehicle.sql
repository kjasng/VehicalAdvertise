-- 0034_garage_install_fee_per_vehicle.sql
-- New garage payout model: garage is paid the actual decal-install labour only.
--   install fee  = 200.000 đ / xe (credited to garage on proof approval)
--   maintenance  = 60% × 200.000 = 120.000 đ / xe → retained implicitly by the
--                  platform (NOT credited to the garage, no separate ledger — option A).
-- Previously the garage was credited a flat 3.200.000 đ per contract; this recreates
-- admin_review_install_proof identically EXCEPT install_fee 3.200.000 -> 200.000.

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
  install_fee constant bigint := 200000;  -- garage decal-install labour per vehicle
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
      'Garage decal-install payout (200k/vehicle) for approved proof batch'
    )
    on conflict do nothing
    returning id into payout_ledger_id;
  end if;

  return credited_amount;
end;
$$;
