-- Wheels Earner - partner approval status.
-- Partners must be approved by admin before creating campaigns.
-- Mirrors the driver kyc_status pattern.

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public'
      and t.typname = 'partner_status'
  ) then
    create type public.partner_status as enum ('pending', 'approved', 'rejected');
  end if;
end;
$$;

alter table public.partners
  add column if not exists status        public.partner_status default 'pending'::public.partner_status,
  add column if not exists reject_reason text,
  add column if not exists approved_at   timestamptz;

do $$
declare
  status_udt_name text;
begin
  select c.udt_name
  into status_udt_name
  from information_schema.columns c
  where c.table_schema = 'public'
    and c.table_name = 'partners'
    and c.column_name = 'status';

  if status_udt_name is not null and status_udt_name <> 'partner_status' then
    update public.partners
    set status = 'pending'
    where status::text not in ('pending', 'approved', 'rejected')
      or status is null;

    alter table public.partners
      alter column status drop default,
      alter column status type public.partner_status using status::text::public.partner_status;
  end if;
end;
$$;

update public.partners
set status = 'pending'
where status is null;

alter table public.partners
  alter column status set default 'pending'::public.partner_status,
  alter column status set not null;
