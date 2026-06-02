-- Atomic admin money ledger writes.
-- Used by manual partner top-ups and ledger adjustment/refund tools.

create or replace function is_admin(uid uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles
    where id = uid
      and role = 'admin'
      and blocked = false
  )
$$;

revoke execute on function is_admin(uuid) from public;
grant execute on function is_admin(uuid) to anon, authenticated, service_role;

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
  action_name text;
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

    action_name := case
      when p_kind = 'partner_topup' then 'partner_topup'
      else 'ledger_' || p_kind::text
    end;

    insert into audit_log (actor_id, action, entity_type, entity_id, diff)
    values (
      p_actor_id,
      action_name,
      'partners',
      p_target_id,
      jsonb_build_object(
        'amount_vnd', p_amount_vnd,
        'kind', p_kind,
        'ledger_entry_id', inserted_id,
        'note', p_note
      )
    );

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

    insert into audit_log (actor_id, action, entity_type, entity_id, diff)
    values (
      p_actor_id,
      'ledger_' || p_kind::text,
      'drivers',
      p_target_id,
      jsonb_build_object(
        'amount_vnd', p_amount_vnd,
        'kind', p_kind,
        'ledger_entry_id', inserted_id,
        'note', p_note
      )
    );

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
