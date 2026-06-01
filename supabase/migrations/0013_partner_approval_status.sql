-- Wheels Earner — partner approval status.
-- Partners must be approved by admin before creating campaigns.
-- Mirrors the driver kyc_status pattern.

create type partner_status as enum ('pending', 'approved', 'rejected');

alter table partners
  add column if not exists status        partner_status not null default 'pending',
  add column if not exists reject_reason text,
  add column if not exists approved_at   timestamptz;
