-- SePay incoming-transfer webhook processing for partner wallet top-ups.

create index if not exists partners_tax_code_idx
  on public.partners (tax_code)
  where tax_code is not null;

create unique index if not exists ledger_entries_sepay_webhook_ref_unique
  on public.ledger_entries (ref_type, ref_id)
  where ref_type = 'sepay_webhook' and ref_id is not null;

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

  insert into audit_log (actor_id, action, entity_type, entity_id, diff)
  values (
    null,
    'partner_topup',
    'partners',
    partner_id,
    jsonb_build_object(
      'source', 'sepay_webhook',
      'txn_id', p_txn_id,
      'amount_vnd', p_amount_vnd,
      'ledger_entry_id', ledger_id,
      'tax_code', normalized_tax_code
    )
  );

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
