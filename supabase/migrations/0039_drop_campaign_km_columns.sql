-- 0039_drop_campaign_km_columns.sql
-- Drop two legacy km-pricing columns on campaigns that have no live consumer:
--   ev_multiplier  -> no reader at all (pricing_rules.ev_multiplier is separate).
--   daily_cap_km   -> only echoed in the admin contracts list; not used in money flow.
-- NOTE: rate_per_km_vnd / target_districts / balance_percent stay for now —
-- they are still wired into partner_create_campaign_with_reserve /
-- ensure_driver_monthly_earning_period and need a dedicated migration.

alter table public.campaigns
  drop column if exists ev_multiplier,
  drop column if exists daily_cap_km;
