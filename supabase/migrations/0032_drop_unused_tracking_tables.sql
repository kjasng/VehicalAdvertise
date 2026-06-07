-- 0032_drop_unused_tracking_tables.sql
-- Drop GPS tracking, QR scan, and contract daily stats tables which are unused
-- by the application. Recreate admin_purge_user_data without the three deletes
-- that reference these tables. PostGIS extension is also dropped since only
-- gps_logs used its geometry type.

create or replace function public.admin_purge_user_data(p_user uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_contracts uuid[];
begin
  -- Contracts the user owns: directly as the assigned driver, or indirectly via
  -- the campaigns they own as a partner.
  select coalesce(array_agg(c.id), '{}')
    into v_contracts
  from contracts c
  where c.driver_id = p_user
     or c.campaign_id in (select id from campaigns where partner_id = p_user);

  -- Contract-scoped children first (driver_invoices before earning_periods to
  -- satisfy the RESTRICT FK between them).
  delete from driver_invoices
    where driver_id = p_user or contract_id = any(v_contracts);
  delete from driver_earning_periods
    where driver_id = p_user or contract_id = any(v_contracts);
  delete from garage_earnings        where contract_id = any(v_contracts);
  delete from ledger_entries
    where partner_id = p_user
       or driver_id  = p_user
       or contract_id = any(v_contracts);
  delete from payouts                where driver_id = p_user;

  -- Parents owned by the user.
  delete from contracts where id = any(v_contracts);
  delete from campaigns where partner_id = p_user;
  delete from vehicles  where driver_id = p_user;
end;
$$;

revoke execute on function public.admin_purge_user_data(uuid) from public, anon, authenticated;
grant  execute on function public.admin_purge_user_data(uuid) to service_role;

-- Drop the unused tracking tables (cascade removes indexes, policies, FKs).
drop table if exists public.qr_scans cascade;
drop table if exists public.contract_daily_stats cascade;
drop table if exists public.gps_logs cascade;

-- PostGIS was only used by gps_logs (geometry column). Drop it now that the
-- table is gone. Verified: no other usage in src/.
drop extension if exists postgis cascade;
