-- Role-specific pricing settings surfaced in the admin pricing page.

alter table public.pricing_rules
  add column if not exists partner_minimum_cap_vnd bigint not null default 0
    check (partner_minimum_cap_vnd >= 0),
  add column if not exists minimum_daily_km int not null default 0
    check (minimum_daily_km >= 0);
