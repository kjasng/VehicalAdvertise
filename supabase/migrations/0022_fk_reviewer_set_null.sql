-- 0022_fk_reviewer_set_null.sql
-- Make reviewer/actor/approver references to profiles(id) survive user deletion.
--
-- Problem: auth.users -> profiles is ON DELETE CASCADE, but several nullable
-- "who-did-it" columns reference profiles(id) with the default NO ACTION. When
-- an admin deletes a user, the cascade into profiles is blocked by these child
-- FKs (most commonly audit_log.actor_id), surfacing as the opaque GoTrue error
-- "Database error deleting user".
--
-- Fix: switch each of these FKs to ON DELETE SET NULL. These columns are all
-- nullable history fields, so nulling "who reviewed/approved/acted" on delete
-- preserves the underlying record while unblocking user deletion.
--
-- Robust + idempotent: look up the actual FK constraint name from pg_constraint
-- per (table, column) and recreate it, regardless of the original name.

do $$
declare
  targets text[][] := array[
    array['audit_log',       'actor_id'],
    array['profiles',        'kyc_reviewed_by'],
    array['vehicles',        'approved_by'],
    array['campaigns',       'reviewed_by'],
    array['photos',          'reviewed_by'],
    array['pricing_rules',   'created_by'],
    array['contracts',       'earning_approved_by'],
    array['driver_invoices', 'reviewed_by'],
    array['garage_earnings', 'approved_by']
  ];
  t text;
  c text;
  con_name text;
  i int;
begin
  for i in 1 .. array_length(targets, 1) loop
    t := targets[i][1];
    c := targets[i][2];

    -- Find the existing FK constraint on public.<t>(<c>) -> profiles(id)
    select con.conname
      into con_name
    from pg_constraint con
    join pg_class rel       on rel.oid = con.conrelid
    join pg_namespace nsp   on nsp.oid = rel.relnamespace
    join pg_attribute att   on att.attrelid = con.conrelid
                           and att.attnum = con.conkey[1]
    where con.contype = 'f'
      and nsp.nspname = 'public'
      and rel.relname = t
      and att.attname = c
      and array_length(con.conkey, 1) = 1;

    if con_name is null then
      raise notice 'skip %.% — no single-column FK found', t, c;
      continue;
    end if;

    execute format('alter table public.%I drop constraint %I', t, con_name);
    execute format(
      'alter table public.%I add constraint %I foreign key (%I) references public.profiles(id) on delete set null',
      t, con_name, c
    );
    raise notice 'rewired %.% (%) -> on delete set null', t, c, con_name;
  end loop;
end $$;
