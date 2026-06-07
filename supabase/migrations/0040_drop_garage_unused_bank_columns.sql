-- 0040_drop_garage_unused_bank_columns.sql
-- Mirror of the drivers cleanup (0038) for garages: bank_branch/bank_bin were
-- never written by the garage payout form (always null); bank_verified_at is a
-- stub (always null, no verify flow). Payout uses bank_account_name/number/bank_name.

alter table public.garages
  drop column if exists bank_branch,
  drop column if exists bank_bin,
  drop column if exists bank_verified_at;
