-- 0025_admin_purge_user_data_rpc.sql
-- Atomic, dependency-ordered cleanup of a user's owned data so an admin can
-- hard-delete partner/driver/garage accounts.
--
-- Several real-data FKs are NOACTION and block the auth.users -> profiles
-- cascade (e.g. ledger_entries.partner_id/driver_id, payouts.driver_id,
-- contracts.driver_id/vehicle_id, qr_scans.contract_id). These columns are
-- mostly NOT NULL, so SET NULL is not an option — the rows must be removed.
--
-- This function deletes everything that hangs off the target user (as driver
-- and/or as the partner owning the campaigns), in child-before-parent order,
-- in a single transaction. The role sub-row (drivers/partners/garages) and
-- profiles row are intentionally left for the auth.admin.deleteUser cascade.
--
-- WARNING: destructive. Permanently removes the user's contracts, ledger
-- entries, payouts and invoices. Admin-only (revoked from anon/authenticated).

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
  delete from qr_scans               where contract_id = any(v_contracts);
  delete from gps_logs               where contract_id = any(v_contracts);
  delete from contract_daily_stats   where contract_id = any(v_contracts);
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
