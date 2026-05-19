-- Wheels Earner — schema (DDL from plans/260513-1149-wheels-earner-day1/architecture.md §2)
-- Apply with: supabase db push

create extension if not exists pgcrypto;
create extension if not exists postgis;

-- 2.1 Enums
create type user_role        as enum ('driver','partner','admin','garage');
create type kyc_status       as enum ('pending','approved','rejected');
create type vehicle_fuel     as enum ('petrol','diesel','electric','hybrid');
create type campaign_status  as enum (
  'draft','submitted','approved','rejected',
  'awaiting_install','active','paused','completed','cancelled');
create type contract_status  as enum (
  'matched','awaiting_install','installed','running',
  'completed','terminated','disputed');
create type photo_kind       as enum (
  'kyc_cccd_front','kyc_cccd_back','kyc_selfie',
  'install_proof','removal_proof',
  'periodic_vehicle','periodic_selfie');
create type photo_status     as enum ('pending','approved','rejected');
create type payout_status    as enum ('pending','processing','paid','failed');
create type ledger_kind      as enum (
  'partner_topup','partner_charge','driver_accrual',
  'driver_payout','platform_fee','adjustment','refund');

-- 2.2 Identity
create table profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  role            user_role not null,
  full_name       text not null,
  phone_e164      text unique not null,
  email           text,
  kyc_status      kyc_status not null default 'pending',
  kyc_reviewed_by uuid references profiles(id),
  kyc_reviewed_at timestamptz,
  blocked         boolean not null default false,
  created_at      timestamptz not null default now()
);

create table partners (
  id              uuid primary key references profiles(id) on delete cascade,
  company_name    text not null,
  tax_code        text,
  billing_address text,
  balance_vnd     bigint not null default 0 check (balance_vnd >= 0)
);

create table drivers (
  id                  uuid primary key references profiles(id) on delete cascade,
  cccd_number         text unique,
  bank_account_number text,
  bank_account_name   text,
  bank_bin            text,
  primary_city        text not null default 'Hanoi',
  rating              numeric(3,2) default 5.00
);

create table garages (
  id          uuid primary key references profiles(id) on delete cascade,
  shop_name   text not null,
  address     text not null,
  lng         numeric(9,6),
  lat         numeric(9,6),
  rating      numeric(3,2) default 5.00,
  approved    boolean not null default false
);

-- 2.3 Vehicles (cars only in MVP)
create table vehicles (
  id                   uuid primary key default gen_random_uuid(),
  driver_id            uuid not null references drivers(id) on delete cascade,
  plate                text not null,
  fuel                 vehicle_fuel not null,
  brand                text,
  model                text,
  year                 int,
  registration_doc_url text,
  approved             boolean not null default false,
  approved_by          uuid references profiles(id),
  approved_at          timestamptz,
  unique (driver_id, plate)
);
create index vehicles_driver_approved_idx on vehicles (driver_id) where approved;

-- 2.4 Campaigns + Contracts
create table campaigns (
  id                    uuid primary key default gen_random_uuid(),
  partner_id            uuid not null references partners(id),
  name                  text not null,
  brief                 text,
  creative_url          text,
  qr_target_url         text not null,
  budget_vnd            bigint not null check (budget_vnd > 0),
  spent_vnd             bigint not null default 0,
  rate_per_km_vnd       int not null,
  daily_cap_km          int not null default 150,
  ev_multiplier         numeric(3,2) not null default 1.30,
  start_date            date not null,
  end_date              date not null,
  target_districts      text[],
  target_vehicle_types  vehicle_fuel[],
  status                campaign_status not null default 'draft',
  reviewed_by           uuid references profiles(id),
  reviewed_at           timestamptz,
  reject_reason         text,
  created_at            timestamptz not null default now(),
  check (end_date >= start_date),
  check (spent_vnd <= budget_vnd)
);
create index campaigns_status_start_idx on campaigns (status, start_date);

create table contracts (
  id                uuid primary key default gen_random_uuid(),
  campaign_id       uuid not null references campaigns(id) on delete cascade,
  vehicle_id        uuid not null references vehicles(id),
  driver_id         uuid not null references drivers(id),
  status            contract_status not null default 'matched',
  install_garage_id uuid references garages(id),
  installed_at      timestamptz,
  removed_at        timestamptz,
  km_total          numeric(10,2) not null default 0,
  earned_vnd        bigint not null default 0,
  created_at        timestamptz not null default now(),
  unique (campaign_id, vehicle_id)
);
create index contracts_driver_status_idx   on contracts (driver_id, status);
create index contracts_campaign_status_idx on contracts (campaign_id, status);

-- 2.5 GPS raw + rollup
create table gps_logs (
  id           bigserial primary key,
  contract_id  uuid not null references contracts(id) on delete cascade,
  ts           timestamptz not null,
  point        geography(point,4326) not null,
  speed_kmh    numeric(5,2),
  accuracy_m   numeric(6,2),
  battery_pct  smallint,
  client_seq   bigint not null,
  client_nonce text not null,
  server_ts    timestamptz not null default now(),
  ip_country   text,
  unique (contract_id, client_seq)
);
create index gps_logs_contract_ts_idx on gps_logs (contract_id, ts);

create table contract_daily_stats (
  contract_id    uuid not null references contracts(id) on delete cascade,
  day            date not null,
  km_valid       numeric(10,2) not null default 0,
  km_rejected    numeric(10,2) not null default 0,
  active_min     int not null default 0,
  earned_vnd     bigint not null default 0,
  qr_scans       int not null default 0,
  photo_required boolean not null default false,
  photo_done     boolean not null default false,
  primary key (contract_id, day)
);

-- 2.6 Photos, QR scans, Money, Audit
create table photos (
  id            uuid primary key default gen_random_uuid(),
  subject_id    uuid not null,
  subject_type  text not null check (subject_type in ('driver','vehicle','contract')),
  kind          photo_kind not null,
  storage_path  text not null,
  exif_taken_at timestamptz,
  exif_lat      numeric(9,6),
  exif_lng      numeric(9,6),
  client_ts     timestamptz,
  client_lat    numeric(9,6),
  client_lng    numeric(9,6),
  status        photo_status not null default 'pending',
  reviewed_by   uuid references profiles(id),
  reviewed_at   timestamptz,
  reject_reason text,
  created_at    timestamptz not null default now()
);
create index photos_subject_kind_status_idx on photos (subject_id, kind, status);

create table qr_scans (
  id          bigserial primary key,
  contract_id uuid not null references contracts(id),
  scanned_at  timestamptz not null default now(),
  user_agent  text,
  ip          inet,
  referrer    text,
  geo_city    text
);
create index qr_scans_contract_scanned_idx on qr_scans (contract_id, scanned_at desc);

create table ledger_entries (
  id          bigserial primary key,
  ts          timestamptz not null default now(),
  kind        ledger_kind not null,
  partner_id  uuid references partners(id),
  driver_id   uuid references drivers(id),
  contract_id uuid references contracts(id),
  amount_vnd  bigint not null,
  ref_type    text,
  ref_id      text,
  note        text
);
create index ledger_partner_ts_idx on ledger_entries (partner_id, ts desc);
create index ledger_driver_ts_idx  on ledger_entries (driver_id,  ts desc);

create table payouts (
  id             uuid primary key default gen_random_uuid(),
  driver_id      uuid not null references drivers(id),
  period_start   date not null,
  period_end     date not null,
  amount_vnd     bigint not null check (amount_vnd > 0),
  status         payout_status not null default 'pending',
  sepay_qr_url   text,
  paid_at        timestamptz,
  failure_reason text,
  created_at     timestamptz not null default now()
);

create table sepay_webhook_events (
  id           bigserial primary key,
  txn_id       text unique not null,
  payload      jsonb not null,
  received_at  timestamptz not null default now(),
  processed_at timestamptz,
  error        text
);

create table pricing_rules (
  id                   uuid primary key default gen_random_uuid(),
  effective_from       date not null,
  base_rate_per_km_vnd int not null,
  ev_multiplier        numeric(3,2) not null,
  daily_cap_km         int not null,
  platform_fee_pct     numeric(5,2) not null,
  created_by           uuid references profiles(id),
  created_at           timestamptz not null default now()
);

create table audit_log (
  id          bigserial primary key,
  actor_id    uuid references profiles(id),
  action      text not null,
  entity_type text not null,
  entity_id   uuid,
  diff        jsonb,
  ts          timestamptz not null default now()
);
