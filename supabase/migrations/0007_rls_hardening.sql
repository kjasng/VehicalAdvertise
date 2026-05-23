-- Wheels Earner -- RLS hardening (review findings C1, H1, H2, H3, H4).
-- Closes column-level role/state escalation paths that the broad
-- `for update using (id = auth.uid())` policies left open.
--
-- Apply with: supabase db push

-- ---------------------------------------------------------------------------
-- C1. profiles -- restrict self-update columns. Privileged columns must flow
--     through choose_role / admin RLS only.
-- ---------------------------------------------------------------------------

drop policy if exists profiles_self_update on profiles;
create policy profiles_self_update on profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

revoke update (role, kyc_status, kyc_reviewed_by, kyc_reviewed_at, blocked)
  on profiles from anon, authenticated;

-- ---------------------------------------------------------------------------
-- H1. drivers / partners / garages -- sub-rows must exist after choose_role.
--     Seed inside the RPC (single ACID step). Also add self-update RLS for
--     partners/garages (parity with drivers), and revoke sensitive columns.
-- ---------------------------------------------------------------------------

-- Self-update policies (drivers already has one; add for partners/garages).
drop policy if exists partners_self_update on partners;
create policy partners_self_update on partners for update
  using (id = auth.uid())
  with check (id = auth.uid());

drop policy if exists garages_self_update on garages;
create policy garages_self_update on garages for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- partners.balance_vnd is service-role-managed (top-ups / charges via RPC).
revoke update (balance_vnd) on partners from anon, authenticated;

-- garages.approved is admin-managed.
revoke update (approved) on garages from anon, authenticated;

-- Reseat choose_role to also seed the sub-row. on conflict do nothing is
-- idempotent -- re-running after a partial failure won't error.
create or replace function public.choose_role(target user_role)
returns profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  updated profiles;
  caller  uuid := auth.uid();
begin
  if caller is null then
    raise exception 'choose_role: not authenticated';
  end if;
  if target not in ('driver', 'partner', 'garage') then
    raise exception 'choose_role: target % not self-assignable', target;
  end if;

  update profiles
    set role = target
    where id = caller and role = 'pending'
    returning * into updated;

  if updated.id is null then
    raise exception 'choose_role: caller has no pending profile';
  end if;

  -- Seed the sub-table so first-time edits don't fail under RLS.
  if target = 'driver' then
    insert into drivers (id) values (caller)
      on conflict (id) do nothing;
  elsif target = 'partner' then
    insert into partners (id, company_name)
      values (caller, coalesce(nullif(updated.full_name, ''), 'New partner'))
      on conflict (id) do nothing;
  elsif target = 'garage' then
    insert into garages (id, shop_name, address)
      values (caller, coalesce(nullif(updated.full_name, ''), 'New garage'), '')
      on conflict (id) do nothing;
  end if;

  return updated;
end;
$$;

revoke execute on function public.choose_role(user_role) from public, anon;
grant  execute on function public.choose_role(user_role) to authenticated;

-- ---------------------------------------------------------------------------
-- H2. drivers -- trust columns (rating, cccd_number) admin/service-role only.
-- ---------------------------------------------------------------------------

revoke update (rating, cccd_number) on drivers from anon, authenticated;

-- ---------------------------------------------------------------------------
-- H3. vehicles / campaigns -- approval + spend state are workflow-managed.
-- ---------------------------------------------------------------------------

revoke update (approved, approved_by, approved_at)
  on vehicles from anon, authenticated;

revoke update (status, reviewed_by, reviewed_at, reject_reason, spent_vnd)
  on campaigns from anon, authenticated;

-- ---------------------------------------------------------------------------
-- H4. handle_new_user -- fix regex. `[ -]` is the range U+0020..U+002D (strips
--     spaces and printable punctuation). Use [[:cntrl:]] to target control
--     bytes as the original comment intended.
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  raw_name    text;
  display_name text;
begin
  raw_name := coalesce(
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'name',
    split_part(coalesce(new.email, ''), '@', 1),
    'New user'
  );
  -- Strip control characters and cap length so a hostile provider can't write
  -- 1MB names or inject control bytes into our admin UI.
  display_name := substr(regexp_replace(raw_name, '[[:cntrl:]]', '', 'g'), 1, 120);
  if length(display_name) = 0 then
    display_name := 'New user';
  end if;

  insert into public.profiles (id, role, full_name, phone_e164, email)
  values (new.id, 'pending', display_name, null, new.email)
  on conflict (id) do nothing;

  return new;
end;
$$;
