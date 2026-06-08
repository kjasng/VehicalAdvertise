-- Manual garage approval is no longer part of onboarding. Garage access and
-- operations only require role='garage' plus a matching garages row.

update public.garages
set approved = true
where approved is not true;

alter table public.garages
  alter column approved set default true;

drop policy if exists garages_public_approved on public.garages;

create policy garages_public_read
on public.garages
for select
using (true);

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
