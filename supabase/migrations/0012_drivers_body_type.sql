-- Wheels Earner — add vehicle body type to drivers table.
-- Collected during driver KYC onboarding (Step 1: profile info).
-- Nullable so existing rows are unaffected; admin sees it in KYC review.

alter table drivers
  add column if not exists body_type text
    check (body_type in ('sedan', 'suv', 'hatchback', 'mpv', 'pickup'));
