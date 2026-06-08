-- Backfill garage sub-rows for profiles that were promoted directly to role garage.
-- Without this, existing garage users can log in but get bounced by /garage pages
-- that require a matching garages row.

insert into public.garages (id, shop_name, address)
select
  p.id,
  coalesce(nullif(btrim(p.full_name), ''), 'New garage'),
  'Chưa cập nhật'
from public.profiles p
where p.role = 'garage'
  and not exists (
    select 1
    from public.garages g
    where g.id = p.id
  );
