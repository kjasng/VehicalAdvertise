-- Driver and garage withdrawals are handled manually by admin.
-- Request reserves balance as pending; admin approves, transfers externally,
-- then marks paid. Failed/rejected requests refund the reserved balance.

update public.garage_withdrawals
set status = 'pending'
where status = 'processing'
  and paid_at is null;

alter table public.garage_withdrawals
  alter column status set default 'pending';

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

  insert into audit_log (actor_id, action, entity_type, entity_id, diff)
  values (
    p_garage_id,
    'garage_withdrawal_requested',
    'garage_withdrawals',
    withdrawal_id,
    jsonb_build_object('amount_vnd', p_amount_vnd, 'status', 'pending')
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

  insert into audit_log (actor_id, action, entity_type, entity_id, diff)
  values (
    p_actor_id,
    'garage_withdrawal_' || p_decision,
    'garage_withdrawals',
    withdrawal_row.id,
    jsonb_build_object(
      'from', withdrawal_row.status,
      'to', next_status,
      'amount_vnd', withdrawal_row.amount_vnd,
      'reason', p_reason
    )
  );

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

-- Driver withdrawal approval is also manual. Keep payout reservation,
-- invoice approval, ledger debit, and final paid state in DB transactions.

create unique index if not exists ledger_driver_invoice_payout_uidx
  on public.ledger_entries (kind, ref_type, ref_id)
  where kind = 'driver_payout'
    and ref_type = 'driver_invoice'
    and ref_id is not null;

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

  insert into audit_log (actor_id, action, entity_type, entity_id, diff)
  values (
    p_actor_id,
    'driver_withdrawal_approved',
    'driver_invoices',
    invoice_row.id,
    jsonb_build_object(
      'payout_id', new_payout_id,
      'amount_vnd', invoice_row.amount_vnd,
      'status', 'processing'
    )
  );

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

  insert into audit_log (actor_id, action, entity_type, entity_id, diff)
  values (
    p_actor_id,
    'driver_payout_marked_paid',
    'payouts',
    payout_row.id,
    jsonb_build_object('amount_vnd', payout_row.amount_vnd, 'status', 'paid')
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
