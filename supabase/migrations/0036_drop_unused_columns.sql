-- 0036_drop_unused_columns.sql
-- Drop 17 columns left over from removed/never-built features, to keep the
-- schema (and class diagram) honest. See plan 260607-2336-drop-unused-columns-gps.
--   GPS-delta on photos was already dead: exif_/client_ lat-lng were never
--   written, so gpsDelta() always returned null.

-- (1) DDL-only dead columns (no app/RPC reader)
alter table public.campaigns              drop column if exists target_vehicle_types;
alter table public.contracts              drop column if exists earned_vnd;
alter table public.driver_earning_periods drop column if exists earned_vnd;
alter table public.garages                drop column if exists lat,
                                          drop column if exists lng,
                                          drop column if exists rating;
alter table public.drivers                drop column if exists rating;
alter table public.payouts                drop column if exists sepay_qr_url;
alter table public.vehicles               drop column if exists registration_doc_url,
                                          drop column if exists year;

-- (2) photos GPS metadata (gpsDelta feature removed)
alter table public.photos drop column if exists exif_lat,
                          drop column if exists exif_lng,
                          drop column if exists exif_taken_at,
                          drop column if exists client_lat,
                          drop column if exists client_lng,
                          drop column if exists client_ts;

-- (3) write-only, no reader
alter table public.pricing_rules drop column if exists created_by;
