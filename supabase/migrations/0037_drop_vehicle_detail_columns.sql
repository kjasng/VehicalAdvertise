-- 0037_drop_vehicle_detail_columns.sql
-- Slim the vehicles table to plate + approval only. fuel/brand/model were
-- display-only and dropped per product decision; approved_by/approved_at were
-- never written by any RPC or app code (dead audit columns).
-- The vehicle_fuel enum becomes orphaned once vehicles.fuel is gone
-- (campaigns.target_vehicle_types was dropped in 0036), so drop it too.

alter table public.vehicles
  drop column if exists fuel,
  drop column if exists brand,
  drop column if exists model,
  drop column if exists approved_by,
  drop column if exists approved_at;

drop type if exists public.vehicle_fuel;
