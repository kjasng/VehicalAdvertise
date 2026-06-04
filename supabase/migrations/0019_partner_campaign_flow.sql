-- Partner campaign flow metadata.
-- Keeps existing campaign_status enum. Partner "Published" maps to submitted.

alter table public.campaigns
  add column if not exists requested_driver_count int
    check (requested_driver_count is null or requested_driver_count > 0),
  add column if not exists creative_urls text[] not null default '{}';
