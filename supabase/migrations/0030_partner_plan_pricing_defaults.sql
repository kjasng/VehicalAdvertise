-- Partner plan pricing defaults.
-- Fixed garage install payout: 3.2m VND.
-- Partner platform fee: 10%.

insert into public.pricing_rules (
  effective_from,
  base_rate_per_km_vnd,
  ev_multiplier,
  daily_cap_km,
  platform_fee_pct,
  install_fee_vnd,
  partner_minimum_cap_vnd,
  minimum_daily_km,
  created_by
)
select
  current_date,
  coalesce(latest.base_rate_per_km_vnd, 1500),
  coalesce(latest.ev_multiplier, 1.30),
  coalesce(latest.daily_cap_km, 150),
  10.00,
  3200000,
  coalesce(latest.partner_minimum_cap_vnd, 0),
  coalesce(latest.minimum_daily_km, 0),
  null
from (select 1) seed
left join lateral (
  select *
  from public.pricing_rules
  order by effective_from desc, created_at desc
  limit 1
) latest on true
where not exists (
  select 1
  from public.pricing_rules
  where effective_from = current_date
    and platform_fee_pct = 10.00
    and install_fee_vnd = 3200000
);

update public.campaigns
set platform_fee_pct = 10.00
where platform_fee_pct = 0.00;
