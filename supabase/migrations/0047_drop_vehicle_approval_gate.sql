-- 0047: drop vehicle approval gate
-- Manual review/approval gates removed product-wide (see driver-KYC + partner
-- approval removal in 0044/0045). A driver's registered vehicle is usable for
-- campaign assignment immediately once a plate is set, so the `approved` flag is
-- no longer meaningful.

-- Partial index depends on the column; drop it first.
drop index if exists vehicles_driver_approved_idx;

alter table vehicles
  drop column if exists approved;
