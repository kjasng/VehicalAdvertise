-- 0041_drop_pricing_rules_km_columns.sql
-- Drop the legacy km-pricing config columns on pricing_rules. They are admin-only
-- config with no RPC/money-flow consumer (earning uses monthly cap, not km).
-- pricing_rules keeps the live config: platform_fee_pct, install_fee_vnd,
-- garage_minimum_withdrawal_vnd, partner_minimum_cap_vnd.

alter table public.pricing_rules
  drop column if exists base_rate_per_km_vnd,
  drop column if exists ev_multiplier,
  drop column if exists daily_cap_km,
  drop column if exists minimum_daily_km;
