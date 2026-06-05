-- Wheels Earner — seed: one admin + default pricing rule (car-only).
-- Run after migrations: psql ... -f supabase/seed.sql
-- The admin user_id is fixed so the same seed is idempotent across local resets.

-- Idempotent admin user (uses supabase auth.users). UUID is stable.
insert into auth.users (
  id, instance_id, aud, role,
  email, encrypted_password,
  raw_app_meta_data, raw_user_meta_data,
  email_confirmed_at, phone_confirmed_at, phone,
  created_at, updated_at, confirmation_token,
  email_change, email_change_token_new, recovery_token
)
values (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'admin@wheels-earner.local',
  crypt('changeme-on-first-login', gen_salt('bf')),
  '{"provider":"phone","providers":["phone"]}'::jsonb,
  '{"full_name":"Platform Admin"}'::jsonb,
  now(), now(), '+84900000001',
  now(), now(), '', '', '', ''
)
on conflict (id) do nothing;

insert into profiles (id, role, full_name, phone_e164, email, kyc_status)
values (
  '00000000-0000-0000-0000-000000000001',
  'admin',
  'Platform Admin',
  '+84900000001',
  'admin@wheels-earner.local',
  'approved'
)
on conflict (id) do nothing;

-- Default pricing rule — car-only, 1500 VND/km, EV multiplier 1.30, daily cap 150 km,
-- 10% platform fee, 3.2m VND fixed garage install payout.
insert into pricing_rules (
  effective_from, base_rate_per_km_vnd, ev_multiplier,
  daily_cap_km, platform_fee_pct, install_fee_vnd, created_by
)
values (
  current_date,
  1500,
  1.30,
  150,
  10.00,
  3200000,
  '00000000-0000-0000-0000-000000000001'
)
on conflict do nothing;
