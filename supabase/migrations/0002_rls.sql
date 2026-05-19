-- Wheels Earner — RLS (architecture.md §2.7)
-- Deny-by-default; explicit allow only. All money/GPS writes go through service-role API.
--
-- `is_admin()` is defined here (rather than 0003) so the policies below can reference it
-- without forward-declaration. security definer + bypass on profiles avoids RLS recursion
-- when a policy on profiles itself needs to check admin status.
create or replace function is_admin(uid uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from profiles where id = uid and role = 'admin')
$$;

revoke execute on function is_admin(uuid) from public;
grant  execute on function is_admin(uuid) to anon, authenticated, service_role;

-- profiles
alter table profiles enable row level security;
create policy profiles_self_read   on profiles for select using (id = auth.uid());
create policy profiles_self_update on profiles for update using (id = auth.uid());
create policy profiles_admin_all   on profiles for all    using (is_admin());

-- partners
alter table partners enable row level security;
create policy partners_self_read on partners for select using (id = auth.uid());
create policy partners_admin_all on partners for all    using (is_admin());

-- drivers
alter table drivers enable row level security;
create policy drivers_self_read   on drivers for select using (id = auth.uid());
create policy drivers_self_update on drivers for update using (id = auth.uid());
create policy drivers_admin_all   on drivers for all    using (is_admin());

-- garages
alter table garages enable row level security;
create policy garages_self_read       on garages for select using (id = auth.uid());
create policy garages_admin_all       on garages for all    using (is_admin());
create policy garages_public_approved on garages for select using (approved = true);

-- vehicles
alter table vehicles enable row level security;
create policy vehicles_driver_own on vehicles for all using (driver_id = auth.uid());
create policy vehicles_admin_all  on vehicles for all using (is_admin());

-- campaigns
alter table campaigns enable row level security;
create policy campaigns_partner_own on campaigns for all using (partner_id = auth.uid());
create policy campaigns_admin_all   on campaigns for all using (is_admin());

-- contracts
alter table contracts enable row level security;
create policy contracts_driver_read  on contracts for select using (driver_id = auth.uid());
create policy contracts_partner_read on contracts for select using (
  campaign_id in (select id from campaigns where partner_id = auth.uid())
);
create policy contracts_garage_read on contracts for select using (
  install_garage_id = auth.uid()
);
create policy contracts_admin_all on contracts for all using (is_admin());

-- gps_logs — service-role writes only; readers scoped by ownership.
alter table gps_logs enable row level security;
create policy gps_no_client_insert on gps_logs for insert with check (false);
create policy gps_no_client_update on gps_logs for update using     (false);
create policy gps_no_client_delete on gps_logs for delete using     (false);
create policy gps_driver_read on gps_logs for select using (
  contract_id in (select id from contracts where driver_id = auth.uid())
);
create policy gps_partner_read on gps_logs for select using (
  contract_id in (
    select c.id from contracts c
    join campaigns cmp on cmp.id = c.campaign_id
    where cmp.partner_id = auth.uid()
  )
);
create policy gps_admin_all on gps_logs for all using (is_admin());

-- contract_daily_stats — service-role writes only.
alter table contract_daily_stats enable row level security;
create policy stats_no_client_insert on contract_daily_stats for insert with check (false);
create policy stats_no_client_update on contract_daily_stats for update using     (false);
create policy stats_no_client_delete on contract_daily_stats for delete using     (false);
create policy stats_driver_read on contract_daily_stats for select using (
  contract_id in (select id from contracts where driver_id = auth.uid())
);
create policy stats_partner_read on contract_daily_stats for select using (
  contract_id in (
    select c.id from contracts c
    join campaigns cmp on cmp.id = c.campaign_id
    where cmp.partner_id = auth.uid()
  )
);
create policy stats_admin_all on contract_daily_stats for all using (is_admin());

-- photos
alter table photos enable row level security;
create policy photos_driver_own on photos for select using (
  (subject_type = 'driver'   and subject_id = auth.uid()) or
  (subject_type = 'vehicle'  and subject_id in (select id from vehicles  where driver_id = auth.uid())) or
  (subject_type = 'contract' and subject_id in (select id from contracts where driver_id = auth.uid()))
);
-- Drivers can only submit KYC and periodic photos themselves; install/removal proofs come from garages.
create policy photos_driver_insert on photos for insert with check (
  (
    subject_type = 'driver'
    and subject_id = auth.uid()
    and kind in ('kyc_cccd_front','kyc_cccd_back','kyc_selfie','periodic_selfie')
  ) or (
    subject_type = 'vehicle'
    and subject_id in (select id from vehicles where driver_id = auth.uid())
    and kind = 'periodic_vehicle'
  ) or (
    subject_type = 'contract'
    and subject_id in (select id from contracts where driver_id = auth.uid())
    and kind = 'periodic_vehicle'
  )
);
create policy photos_garage_install on photos for insert with check (
  subject_type = 'contract'
  and kind in ('install_proof','removal_proof')
  and subject_id in (select id from contracts where install_garage_id = auth.uid())
);
create policy photos_admin_all on photos for all using (is_admin());

-- qr_scans — service-role writes only; partners read their own.
alter table qr_scans enable row level security;
create policy qr_no_client_insert on qr_scans for insert with check (false);
create policy qr_no_client_update on qr_scans for update using     (false);
create policy qr_no_client_delete on qr_scans for delete using     (false);
create policy qr_partner_read on qr_scans for select using (
  contract_id in (
    select c.id from contracts c
    join campaigns cmp on cmp.id = c.campaign_id
    where cmp.partner_id = auth.uid()
  )
);
create policy qr_admin_all on qr_scans for all using (is_admin());

-- ledger_entries — service-role writes only.
alter table ledger_entries enable row level security;
create policy ledger_no_client_insert on ledger_entries for insert with check (false);
create policy ledger_no_client_update on ledger_entries for update using     (false);
create policy ledger_no_client_delete on ledger_entries for delete using     (false);
create policy ledger_partner_read on ledger_entries for select using (partner_id = auth.uid());
create policy ledger_driver_read  on ledger_entries for select using (driver_id  = auth.uid());
create policy ledger_admin_all    on ledger_entries for all    using (is_admin());

-- payouts
alter table payouts enable row level security;
create policy payouts_driver_read on payouts for select using (driver_id = auth.uid());
create policy payouts_admin_all   on payouts for all    using (is_admin());

-- sepay_webhook_events — service-role only.
alter table sepay_webhook_events enable row level security;
create policy sepay_no_client_insert on sepay_webhook_events for insert with check (false);
create policy sepay_no_client_update on sepay_webhook_events for update using     (false);
create policy sepay_no_client_delete on sepay_webhook_events for delete using     (false);
create policy sepay_admin_all on sepay_webhook_events for select using (is_admin());

-- pricing_rules — admin-managed; readable by signed-in users only (not anon) so the
-- platform fee % stays private from drive-by visitors.
alter table pricing_rules enable row level security;
create policy pricing_authed_read on pricing_rules for select to authenticated using (true);
create policy pricing_admin_all   on pricing_rules for all    using (is_admin());

-- audit_log — admin-read; service-role inserts.
alter table audit_log enable row level security;
create policy audit_admin_read       on audit_log for select using     (is_admin());
create policy audit_no_client_insert on audit_log for insert with check (false);
create policy audit_no_client_update on audit_log for update using     (false);
create policy audit_no_client_delete on audit_log for delete using     (false);
