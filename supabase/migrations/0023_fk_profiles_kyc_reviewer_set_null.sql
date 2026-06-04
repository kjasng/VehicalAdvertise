-- 0023_fk_profiles_kyc_reviewer_set_null.sql
-- Follow-up to 0022: the kyc_reviewed_by reviewer column lives on profiles
-- (self-referential FK profiles.kyc_reviewed_by -> profiles.id), not drivers.
-- 0022 targeted the wrong table and skipped it, leaving this self-reference with
-- the default NO ACTION — which blocks deleting a user who reviewed someone's KYC
-- (and the profiles cascade itself). Switch it to ON DELETE SET NULL here.
--
-- Idempotent: re-running on a fresh DB (where 0022's corrected entry already set
-- it) simply drops and re-adds the same SET NULL constraint.

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
    and rel.relname = 'profiles'
    and att.attname = 'kyc_reviewed_by'
    and array_length(con.conkey, 1) = 1;

  if con_name is null then
    raise notice 'skip profiles.kyc_reviewed_by — no single-column FK found';
    return;
  end if;

  execute format('alter table public.profiles drop constraint %I', con_name);
  execute format(
    'alter table public.profiles add constraint %I foreign key (kyc_reviewed_by) references public.profiles(id) on delete set null',
    con_name
  );
  raise notice 'rewired profiles.kyc_reviewed_by (%) -> on delete set null', con_name;
end $$;
