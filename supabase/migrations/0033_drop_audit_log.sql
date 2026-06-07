-- 0033_drop_audit_log.sql
-- Remove audit_log table and all writes to it.
-- Every function that previously did `insert into audit_log` is recreated here
-- with that insert (and any variables used solely for it) removed. Business
-- logic is otherwise identical. Latest body sourced from the migration noted
-- above each function.
--
-- Functions recreated (source migration → latest definition):
--   approve_driver_kyc                    (0010)
--   approve_campaign                      (0010)
--   set_user_blocked                      (0010)
--   admin_create_money_ledger_entry       (0014)
--   admin_review_install_proof            (0031)
--   request_garage_withdrawal             (0021)
--   admin_review_garage_withdrawal        (0021)
--   admin_approve_driver_withdrawal       (0021)
--   admin_mark_driver_payout_paid         (0021)
--   process_sepay_partner_topup_webhook   (0027)
--   partner_create_campaign_with_reserve  (0031)
--   ensure_driver_monthly_earning_period  (0029)

-- ---------------------------------------------------------------------------
-- approve_driver_kyc  (source: 0010)
-- ---------------------------------------------------------------------------

create or replace function public.approve_driver_kyc(
  p_driver_id uuid,
  p_decision  kyc_status,
  p_reason    text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not is_admin() then
    raise exception 'approve_driver_kyc: admin only';
  end if;

  if p_decision not in ('approved', 'rejected') then
    raise exception 'approve_driver_kyc: decision must be approved or rejected, got %', p_decision;
  end if;

  update profiles set
    kyc_status      = p_decision,
    kyc_reviewed_by = auth.uid(),
    kyc_reviewed_at = now()
  where id = p_driver_id;

  if not found then
    raise exception 'approve_driver_kyc: driver % not found', p_driver_id;
  end if;
end;
$$;

revoke execute on function public.approve_driver_kyc(uuid, kyc_status, text)
  from public, anon;
grant  execute on function public.approve_driver_kyc(uuid, kyc_status, text)
  to authenticated;

-- ---------------------------------------------------------------------------
-- approve_campaign  (source: 0010)
-- ---------------------------------------------------------------------------

create or replace function public.approve_campaign(
  p_campaign_id uuid,
  p_decision    campaign_status,
  p_reason      text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not is_admin() then
    raise exception 'approve_campaign: admin only';
  end if;

  if p_decision not in ('approved', 'rejected') then
    raise exception 'approve_campaign: decision must be approved or rejected, got %', p_decision;
  end if;

  update campaigns set
    status        = p_decision,
    reviewed_by   = auth.uid(),
    reviewed_at   = now(),
    -- clear reject_reason on approval; set it on rejection
    reject_reason = case when p_decision = 'rejected' then p_reason else null end
  where id = p_campaign_id
    and status = 'submitted';  -- state-machine guard: only submitted campaigns can be reviewed

  if not found then
    -- disambiguate: campaign missing vs wrong state
    perform 1 from campaigns where id = p_campaign_id;
    if not found then
      raise exception 'approve_campaign: campaign % not found', p_campaign_id;
    else
      raise exception 'approve_campaign: campaign % is not in submitted state', p_campaign_id;
    end if;
  end if;
end;
$$;

revoke execute on function public.approve_campaign(uuid, campaign_status, text)
  from public, anon;
grant  execute on function public.approve_campaign(uuid, campaign_status, text)
  to authenticated;

-- ---------------------------------------------------------------------------
-- set_user_blocked  (source: 0010)
-- ---------------------------------------------------------------------------

create or replace function public.set_user_blocked(
  p_target_id uuid,
  p_blocked   boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not is_admin() then
    raise exception 'set_user_blocked: admin only';
  end if;

  if p_target_id = auth.uid() then
    raise exception 'set_user_blocked: cannot block yourself';
  end if;

  -- Prevent admin-on-admin blocking (privilege escalation risk in multi-admin setups)
  if exists (select 1 from profiles where id = p_target_id and role = 'admin') then
    raise exception 'set_user_blocked: cannot block another admin';
  end if;

  update profiles set blocked = p_blocked where id = p_target_id;

  if not found then
    raise exception 'set_user_blocked: user % not found', p_target_id;
  end if;
end;
$$;

revoke execute on function public.set_user_blocked(uuid, boolean)
  from public, anon;
grant  execute on function public.set_user_blocked(uuid, boolean)
  to authenticated;

-- ---------------------------------------------------------------------------
-- admin_create_money_ledger_entry  (source: 0014)
-- action_name variable was used solely for the audit_log insert — removed.
-- ---------------------------------------------------------------------------

create or replace function public.admin_create_money_ledger_entry(
  p_actor_id    uuid,
  p_target_type text,
  p_target_id   uuid,
  p_kind        ledger_kind,
  p_amount_vnd  bigint,
  p_note        text,
  p_ref_type    text default null
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted_id bigint;
  current_balance bigint;
begin
  if p_amount_vnd = 0 then
    raise exception 'admin_create_money_ledger_entry: amount must be non-zero';
  end if;

  if not exists (
    select 1 from profiles
    where id = p_actor_id
      and role = 'admin'
      and blocked = false
  ) then
    raise exception 'admin_create_money_ledger_entry: active admin only';
  end if;

  if p_target_type = 'partner' then
    if p_kind not in ('partner_topup', 'partner_charge', 'adjustment', 'refund') then
      raise exception 'admin_create_money_ledger_entry: invalid partner ledger kind %', p_kind;
    end if;

    select balance_vnd into current_balance
    from partners
    where id = p_target_id
    for update;

    if current_balance is null then
      raise exception 'admin_create_money_ledger_entry: partner % not found', p_target_id;
    end if;

    if current_balance + p_amount_vnd < 0 then
      raise exception 'admin_create_money_ledger_entry: partner balance cannot go negative';
    end if;

    update partners
    set balance_vnd = current_balance + p_amount_vnd
    where id = p_target_id;

    insert into ledger_entries (kind, partner_id, amount_vnd, note, ref_type)
    values (p_kind, p_target_id, p_amount_vnd, p_note, p_ref_type)
    returning id into inserted_id;

    return inserted_id;
  elsif p_target_type = 'driver' then
    if p_kind not in ('adjustment', 'refund') then
      raise exception 'admin_create_money_ledger_entry: invalid driver ledger kind %', p_kind;
    end if;

    perform 1 from drivers where id = p_target_id;
    if not found then
      raise exception 'admin_create_money_ledger_entry: driver % not found', p_target_id;
    end if;

    insert into ledger_entries (kind, driver_id, amount_vnd, note, ref_type)
    values (p_kind, p_target_id, p_amount_vnd, p_note, p_ref_type)
    returning id into inserted_id;

    return inserted_id;
  end if;

  raise exception 'admin_create_money_ledger_entry: invalid target type %', p_target_type;
end;
$$;

revoke execute on function public.admin_create_money_ledger_entry(
  uuid,
  text,
  uuid,
  ledger_kind,
  bigint,
  text,
  text
) from public, anon, authenticated;
grant execute on function public.admin_create_money_ledger_entry(
  uuid,
  text,
  uuid,
  ledger_kind,
  bigint,
  text,
  text
) to service_role;

-- ---------------------------------------------------------------------------
-- admin_review_install_proof  (source: 0031)
-- ---------------------------------------------------------------------------

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

-- ---------------------------------------------------------------------------
-- request_garage_withdrawal  (source: 0021)
-- ---------------------------------------------------------------------------

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
    'pending',
    p_bank_snapshot,
    p_invoice_html
  )
  returning id into withdrawal_id;

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

-- ---------------------------------------------------------------------------
-- admin_review_garage_withdrawal  (source: 0021)
-- ---------------------------------------------------------------------------

create or replace function public.admin_review_garage_withdrawal(
  p_actor_id uuid,
  p_withdrawal_id uuid,
  p_decision text,
  p_reason text default null
)
returns payout_status
language plpgsql
security definer
set search_path = public
as $$
declare
  withdrawal_row garage_withdrawals%rowtype;
  next_status payout_status;
begin
  if p_decision not in ('approved', 'paid', 'failed') then
    raise exception 'admin_review_garage_withdrawal: invalid decision %', p_decision;
  end if;

  if p_decision = 'failed' and nullif(trim(coalesce(p_reason, '')), '') is null then
    raise exception 'admin_review_garage_withdrawal: failure reason required';
  end if;

  if not exists (
    select 1 from profiles
    where id = p_actor_id
      and role = 'admin'
      and blocked = false
  ) then
    raise exception 'admin_review_garage_withdrawal: active admin only';
  end if;

  select *
  into withdrawal_row
  from garage_withdrawals
  where id = p_withdrawal_id
  for update;

  if withdrawal_row.id is null then
    raise exception 'admin_review_garage_withdrawal: withdrawal not found';
  end if;

  if p_decision = 'approved' then
    if withdrawal_row.status <> 'pending' then
      raise exception 'admin_review_garage_withdrawal: only pending requests can be approved';
    end if;
    next_status := 'processing';
  elsif p_decision = 'paid' then
    if withdrawal_row.status <> 'processing' then
      raise exception 'admin_review_garage_withdrawal: only approved requests can be paid';
    end if;
    next_status := 'paid';
  else
    if withdrawal_row.status not in ('pending', 'processing') then
      raise exception 'admin_review_garage_withdrawal: withdrawal already finalised';
    end if;
    next_status := 'failed';

    update garages
    set balance_vnd = balance_vnd + withdrawal_row.amount_vnd
    where id = withdrawal_row.garage_id;
  end if;

  update garage_withdrawals
  set status = next_status,
      paid_at = case when next_status = 'paid' then now() else paid_at end,
      failure_reason = case when next_status = 'failed' then p_reason else null end
  where id = withdrawal_row.id;

  return next_status;
end;
$$;

revoke execute on function public.admin_review_garage_withdrawal(
  uuid,
  uuid,
  text,
  text
) from public, anon, authenticated;

grant execute on function public.admin_review_garage_withdrawal(
  uuid,
  uuid,
  text,
  text
) to service_role;

-- ---------------------------------------------------------------------------
-- admin_approve_driver_withdrawal  (source: 0021)
-- ---------------------------------------------------------------------------

create or replace function public.admin_approve_driver_withdrawal(
  p_actor_id uuid,
  p_invoice_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  invoice_row driver_invoices%rowtype;
  available_balance bigint;
  new_payout_id uuid;
begin
  if not exists (
    select 1 from profiles
    where id = p_actor_id
      and role = 'admin'
      and blocked = false
  ) then
    raise exception 'admin_approve_driver_withdrawal: active admin only';
  end if;

  select *
  into invoice_row
  from driver_invoices
  where id = p_invoice_id
  for update;

  if invoice_row.id is null then
    raise exception 'admin_approve_driver_withdrawal: invoice not found';
  end if;

  if invoice_row.status not in ('requested', 'reviewing')
    or invoice_row.payout_id is not null then
    raise exception 'admin_approve_driver_withdrawal: invoice is no longer pending';
  end if;

  perform 1
  from drivers
  where id = invoice_row.driver_id
  for update;

  select coalesce(sum(
    case
      when kind = 'driver_payout' then -amount_vnd
      else amount_vnd
    end
  ), 0)
  into available_balance
  from ledger_entries
  where driver_id = invoice_row.driver_id
    and kind in ('driver_accrual', 'driver_payout', 'adjustment', 'refund');

  if available_balance < invoice_row.amount_vnd then
    raise exception 'admin_approve_driver_withdrawal: driver balance is insufficient';
  end if;

  insert into payouts (
    driver_id,
    amount_vnd,
    period_start,
    period_end,
    status
  )
  values (
    invoice_row.driver_id,
    invoice_row.amount_vnd,
    invoice_row.period_start,
    invoice_row.period_end,
    'processing'
  )
  returning id into new_payout_id;

  insert into ledger_entries (
    driver_id,
    contract_id,
    kind,
    amount_vnd,
    ref_type,
    ref_id,
    note
  )
  values (
    invoice_row.driver_id,
    invoice_row.contract_id,
    'driver_payout',
    invoice_row.amount_vnd,
    'driver_invoice',
    invoice_row.id::text,
    'Manual payout reserved for driver invoice ' || invoice_row.invoice_number
  );

  update driver_invoices
  set status = 'approved',
      payout_id = new_payout_id,
      reviewed_by = p_actor_id,
      reviewed_at = now()
  where id = invoice_row.id;

  return new_payout_id;
end;
$$;

revoke execute on function public.admin_approve_driver_withdrawal(
  uuid,
  uuid
) from public, anon, authenticated;

grant execute on function public.admin_approve_driver_withdrawal(
  uuid,
  uuid
) to service_role;

-- ---------------------------------------------------------------------------
-- admin_mark_driver_payout_paid  (source: 0021)
-- ---------------------------------------------------------------------------

create or replace function public.admin_mark_driver_payout_paid(
  p_actor_id uuid,
  p_payout_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  payout_row payouts%rowtype;
begin
  if not exists (
    select 1 from profiles
    where id = p_actor_id
      and role = 'admin'
      and blocked = false
  ) then
    raise exception 'admin_mark_driver_payout_paid: active admin only';
  end if;

  select *
  into payout_row
  from payouts
  where id = p_payout_id
  for update;

  if payout_row.id is null then
    raise exception 'admin_mark_driver_payout_paid: payout not found';
  end if;

  if payout_row.status not in ('pending', 'processing') then
    raise exception 'admin_mark_driver_payout_paid: payout already finalised';
  end if;

  update payouts
  set status = 'paid',
      paid_at = now(),
      failure_reason = null
  where id = payout_row.id;

  update driver_invoices
  set status = 'paid',
      paid_at = now()
  where payout_id = payout_row.id;

  update driver_earning_periods
  set status = 'paid'
  where id in (
    select earning_period_id
    from driver_invoices
    where payout_id = payout_row.id
  );

  return payout_row.id;
end;
$$;

revoke execute on function public.admin_mark_driver_payout_paid(
  uuid,
  uuid
) from public, anon, authenticated;

grant execute on function public.admin_mark_driver_payout_paid(
  uuid,
  uuid
) to service_role;

-- ---------------------------------------------------------------------------
-- process_sepay_partner_topup_webhook  (source: 0027)
-- ledger_id variable was used solely for the audit_log insert — removed.
-- ---------------------------------------------------------------------------

create or replace function public.process_sepay_partner_topup_webhook(
  p_txn_id text,
  p_payload jsonb,
  p_tax_code text,
  p_amount_vnd bigint,
  p_transfer_type text,
  p_account_number text,
  p_expected_account_number text default null,
  p_min_amount_vnd bigint default 0
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  event_id bigint;
  existing_event record;
  normalized_tax_code text := nullif(trim(coalesce(p_tax_code, '')), '');
  normalized_account text := nullif(trim(coalesce(p_account_number, '')), '');
  expected_account text := nullif(trim(coalesce(p_expected_account_number, '')), '');
  partner_count int;
  partner_id uuid;
  ledger_id bigint;
  note_text text;
  reject_reason text;
begin
  if nullif(trim(coalesce(p_txn_id, '')), '') is null then
    raise exception 'process_sepay_partner_topup_webhook: txn id is required';
  end if;

  insert into sepay_webhook_events (txn_id, payload)
  values (p_txn_id, coalesce(p_payload, '{}'::jsonb))
  on conflict (txn_id) do nothing
  returning id into event_id;

  if event_id is null then
    select id, processed_at, error
    into existing_event
    from sepay_webhook_events
    where txn_id = p_txn_id;

    return jsonb_build_object(
      'status', 'duplicate',
      'event_id', existing_event.id,
      'processed_at', existing_event.processed_at,
      'error', existing_event.error
    );
  end if;

  if p_transfer_type <> 'in' then
    reject_reason := 'ignored_transfer_type';
  elsif expected_account is not null and normalized_account is distinct from expected_account then
    reject_reason := 'account_number_mismatch';
  elsif p_amount_vnd is null or p_amount_vnd <= 0 then
    reject_reason := 'invalid_amount';
  elsif p_min_amount_vnd > 0 and p_amount_vnd < p_min_amount_vnd then
    reject_reason := 'below_minimum_topup';
  elsif normalized_tax_code is null then
    reject_reason := 'tax_code_not_found_in_memo';
  end if;

  if reject_reason is not null then
    update sepay_webhook_events
    set processed_at = now(), error = reject_reason
    where id = event_id;

    return jsonb_build_object('status', 'ignored', 'event_id', event_id, 'error', reject_reason);
  end if;

  select count(*) into partner_count
  from partners
  where tax_code = normalized_tax_code;

  if partner_count = 0 then
    reject_reason := 'partner_not_found';
  elsif partner_count > 1 then
    reject_reason := 'partner_tax_code_not_unique';
  end if;

  if reject_reason is not null then
    update sepay_webhook_events
    set processed_at = now(), error = reject_reason
    where id = event_id;

    return jsonb_build_object('status', 'unmatched', 'event_id', event_id, 'error', reject_reason);
  end if;

  select id into partner_id
  from partners
  where tax_code = normalized_tax_code
  for update;

  update partners
  set balance_vnd = balance_vnd + p_amount_vnd
  where id = partner_id;

  note_text := left(
    concat_ws(
      ' · ',
      'SePay top-up',
      nullif(p_payload->>'content', ''),
      nullif(p_payload->>'referenceCode', '')
    ),
    500
  );

  insert into ledger_entries (kind, partner_id, amount_vnd, note, ref_type, ref_id)
  values ('partner_topup', partner_id, p_amount_vnd, note_text, 'sepay_webhook', p_txn_id)
  returning id into ledger_id;

  update sepay_webhook_events
  set processed_at = now(), error = null
  where id = event_id;

  return jsonb_build_object(
    'status', 'processed',
    'event_id', event_id,
    'partner_id', partner_id,
    'ledger_entry_id', ledger_id
  );
end;
$$;

revoke execute on function public.process_sepay_partner_topup_webhook(
  text,
  jsonb,
  text,
  bigint,
  text,
  text,
  text,
  bigint
) from public, anon, authenticated;

grant execute on function public.process_sepay_partner_topup_webhook(
  text,
  jsonb,
  text,
  bigint,
  text,
  text,
  text,
  bigint
) to service_role;

-- ---------------------------------------------------------------------------
-- partner_create_campaign_with_reserve  (source: 0031)
-- ---------------------------------------------------------------------------

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

-- ---------------------------------------------------------------------------
-- ensure_driver_monthly_earning_period  (source: 0029)
-- No audit_log insert was present in 0029 or later — confirmed by grep.
-- The 0018 version had no audit_log insert either. Recreated from 0029
-- to stay on the latest body (has_reserved_budget branch).
-- ---------------------------------------------------------------------------

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
      kind,
      partner_id,
      driver_id,
      contract_id,
      amount_vnd,
      ref_type,
      ref_id,
      note
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

-- ---------------------------------------------------------------------------
-- Drop the audit_log table.
-- CASCADE removes its RLS policies and the actor_id set-null FK from 0022.
-- ---------------------------------------------------------------------------
drop table if exists public.audit_log cascade;
