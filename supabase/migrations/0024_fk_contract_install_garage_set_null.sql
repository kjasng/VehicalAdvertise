-- 0024_fk_contract_install_garage_set_null.sql
-- Allow deleting a garage user that has acted as installer on contracts.
--
-- contracts.install_garage_id -> garages(id) is nullable but defaults to NO
-- ACTION, so deleting a garage (profiles -> garages cascade) is blocked whenever
-- that garage appears as the installer on any contract, surfacing as the opaque
-- "Database error deleting user".
--
-- install_garage_id is already nullable, so ON DELETE SET NULL is the correct
-- semantics: the contract survives with its installer reference cleared.
--
-- Note: contracts.driver_id is NOT NULL, so driver deletion remains intentionally
-- blocked when contracts exist (handled at the app layer, not here).
--
-- Idempotent: looks up the actual FK constraint name and recreates it.

do $$
declare
  con_name text;
begin
  select con.conname
    into con_name
  from pg_constraint con
  join pg_class rel       on rel.oid = con.conrelid
  join pg_namespace nsp   on nsp.oid = rel.relnamespace
  join pg_attribute att   on att.attrelid = con.conrelid
                         and att.attnum = con.conkey[1]
  where con.contype = 'f'
    and nsp.nspname = 'public'
    and rel.relname = 'contracts'
    and att.attname = 'install_garage_id'
    and array_length(con.conkey, 1) = 1;

  if con_name is null then
    raise notice 'skip contracts.install_garage_id — no single-column FK found';
    return;
  end if;

  execute format('alter table public.contracts drop constraint %I', con_name);
  execute format(
    'alter table public.contracts add constraint %I foreign key (install_garage_id) references public.garages(id) on delete set null',
    con_name
  );
  raise notice 'rewired contracts.install_garage_id (%) -> on delete set null', con_name;
end $$;
