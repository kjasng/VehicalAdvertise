-- 0026_campaign_creatives_bucket.sql
-- Public storage bucket for partner campaign creative images.
--
-- Creatives are shown publicly (admin review + driver app render the decal art),
-- so the bucket is public-read like a CDN; the uploaded public URL is stored in
-- campaigns.creative_urls. Writes are restricted to the partner's own folder.
--
-- Path convention: <auth.uid>/<uuid>.<ext> so RLS can compare the first folder
-- segment to auth.uid() (same pattern as 0009).

insert into storage.buckets (id, name, public)
values ('campaign-creatives', 'campaign-creatives', true)
on conflict (id) do nothing;

-- Self-write: a partner may INSERT/UPDATE/DELETE files only under their own
-- folder. Service-role (server action) bypasses RLS. Public read is implicit
-- for a public bucket, so no SELECT policy is required.
drop policy if exists campaign_creatives_self_write on storage.objects;
create policy campaign_creatives_self_write on storage.objects
  for all
  using (
    bucket_id = 'campaign-creatives'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'campaign-creatives'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
