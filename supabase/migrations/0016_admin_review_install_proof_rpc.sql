-- Atomic admin install proof review.
-- Approving a proof can create one garage install payout ledger row.

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
      'garage_install_payout_ledger_id', payout_ledger_id
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
