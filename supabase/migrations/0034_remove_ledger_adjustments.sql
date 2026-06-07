-- Remove manual ledger adjustment/refund support.
-- This keeps partner top-up atomic while removing the generic admin adjustment path.

do $$
begin
  if exists (
    select 1
    from public.ledger_entries
    where kind::text in ('adjustment', 'refund')
  ) then
    raise exception 'remove ledger adjustments: existing adjustment/refund rows must be reconciled first';
  end if;
end;
$$;

drop function if exists public.admin_create_money_ledger_entry(
  uuid,
  text,
  uuid,
  public.ledger_kind,
  bigint,
  text,
  text
);

drop index if exists public.ledger_driver_invoice_payout_uidx;
drop index if exists public.ledger_driver_earning_period_kind_ref_uidx;

alter table public.ledger_entries
  alter column kind type text using kind::text;

drop type public.ledger_kind;

create type public.ledger_kind as enum (
  'partner_topup',
  'partner_charge',
  'driver_accrual',
  'driver_payout',
  'platform_fee',
  'garage_install_payout'
);

alter table public.ledger_entries
  alter column kind type public.ledger_kind using kind::public.ledger_kind;

create unique index if not exists ledger_driver_earning_period_kind_ref_uidx
  on public.ledger_entries (kind, ref_type, ref_id)
  where ref_type = 'driver_earning_period' and ref_id is not null;

create unique index if not exists ledger_driver_invoice_payout_uidx
  on public.ledger_entries (kind, ref_type, ref_id)
  where kind = 'driver_payout'
    and ref_type = 'driver_invoice'
    and ref_id is not null;

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
  if p_amount_vnd <= 0 then
    raise exception 'admin_create_money_ledger_entry: top-up amount must be positive';
  end if;

  if not exists (
    select 1 from profiles
    where id = p_actor_id
      and role = 'admin'
      and blocked = false
  ) then
    raise exception 'admin_create_money_ledger_entry: active admin only';
  end if;

  if p_target_type <> 'partner' then
    raise exception 'admin_create_money_ledger_entry: invalid target type %', p_target_type;
  end if;

  if p_kind <> 'partner_topup' then
    raise exception 'admin_create_money_ledger_entry: invalid partner ledger kind %', p_kind;
  end if;

  select balance_vnd into current_balance
  from partners
  where id = p_target_id
  for update;

  if current_balance is null then
    raise exception 'admin_create_money_ledger_entry: partner % not found', p_target_id;
  end if;

  update partners
  set balance_vnd = current_balance + p_amount_vnd
  where id = p_target_id;

  insert into ledger_entries (kind, partner_id, amount_vnd, note, ref_type)
  values (p_kind, p_target_id, p_amount_vnd, p_note, p_ref_type)
  returning id into inserted_id;

  return inserted_id;
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
    and kind in ('driver_accrual', 'driver_payout');

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
