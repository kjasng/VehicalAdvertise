-- 0038_drop_driver_unused_columns.sql
-- Trim the drivers table. These columns are display-only / stub / no-op:
--   bank_bin, bank_branch  -> shown as extra label text on the driver invoice;
--                             payout uses bank_account_name/number/bank_name.
--   bank_verified_at       -> only ever written as null (no verify flow exists).
--   operating_districts    -> never written (garage-district filter ran on empty).
-- NOTE: the garages table keeps its own bank_bin/bank_branch/bank_verified_at.

alter table public.drivers
  drop column if exists bank_bin,
  drop column if exists bank_branch,
  drop column if exists bank_verified_at,
  drop column if exists operating_districts;
