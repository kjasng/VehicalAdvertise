-- 0046_partner_plan_pricing_reserve.sql
-- Align live pricing config with the partner plan reserve model.
-- Garage payout is decal-install labour only: 200,000 VND per vehicle.
-- Campaign reserve adds the 60% operations/maintenance reserve in app logic.

update public.pricing_rules
set install_fee_vnd = 200000
where install_fee_vnd <> 200000;
