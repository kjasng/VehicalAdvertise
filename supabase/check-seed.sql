-- Quick post-reset sanity check.
-- Run in Supabase Dashboard → SQL Editor, or:
--   psql "$DATABASE_URL" -f supabase/check-seed.sql
-- Expected after a clean reset+seed: auth.users = 1, profiles = 1 (admin),
-- pricing_rules = 1, every other business table = 0.

-- Row counts across the main tables
select 'auth.users'         as table_name, count(*) as rows from auth.users
union all select 'profiles',            count(*) from public.profiles
union all select 'pricing_rules',       count(*) from public.pricing_rules
union all select 'partners',            count(*) from public.partners
union all select 'drivers',             count(*) from public.drivers
union all select 'garages',             count(*) from public.garages
union all select 'vehicles',            count(*) from public.vehicles
union all select 'campaigns',           count(*) from public.campaigns
union all select 'contracts',           count(*) from public.contracts
union all select 'driver_earning_periods', count(*) from public.driver_earning_periods
union all select 'driver_invoices',     count(*) from public.driver_invoices
union all select 'garage_earnings',     count(*) from public.garage_earnings
union all select 'garage_withdrawals',  count(*) from public.garage_withdrawals
union all select 'ledger_entries',      count(*) from public.ledger_entries
union all select 'payouts',             count(*) from public.payouts
order by table_name;

-- Seeded admin present?
select id, email, role, kyc_status from public.profiles where role = 'admin';

-- Auth users present (should be just the seeded admin)
select id, email, phone, email_confirmed_at is not null as email_confirmed from auth.users;

-- Default pricing rule present?
select effective_from, base_rate_per_km_vnd, ev_multiplier, daily_cap_km,
       platform_fee_pct, install_fee_vnd
from public.pricing_rules
order by effective_from desc
limit 1;
