-- 0043_drop_campaign_rpc_columns.sql
-- Drop the 3 campaign columns now that the money RPCs (0042) no longer reference
-- them: rate_per_km_vnd (was hardcoded 0), target_districts (district targeting
-- feature removed), balance_percent (balance_percent funding mode removed).
-- funding_mode stays (only 'monthly_cap' now).

alter table public.campaigns
  drop column if exists rate_per_km_vnd,
  drop column if exists target_districts,
  drop column if exists balance_percent;

-- balance_percent funding mode is gone; tighten the CHECK so funding_mode can
-- only ever be 'monthly_cap' (was: monthly_cap | balance_percent).
alter table public.campaigns drop constraint if exists campaigns_funding_mode_check;
alter table public.campaigns
  add constraint campaigns_funding_mode_check check (funding_mode = 'monthly_cap');
