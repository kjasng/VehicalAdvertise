-- Wheels Earner — self-service role selection during onboarding.
-- 'admin' assignment stays admin-only via direct UPDATE under admin RLS.

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
  return updated;
end;
$$;

revoke execute on function public.choose_role(user_role) from public, anon;
grant  execute on function public.choose_role(user_role) to authenticated;
