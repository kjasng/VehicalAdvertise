-- Wheels Earner -- private storage buckets for KYC and vehicle documents.
-- Drivers upload via signed URLs; admin reviews via signed URLs with short TTL.
-- Path convention: <auth.uid>/<photo_id>.<ext> so RLS can compare the first
-- folder segment to auth.uid() without needing the photos table.

-- ---------------------------------------------------------------------------
-- Buckets
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values
  ('driver-kyc', 'driver-kyc', false),
  ('vehicle-docs', 'vehicle-docs', false)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- RLS on storage.objects (RLS is already enabled by Supabase)
-- ---------------------------------------------------------------------------

-- Self-write: a driver may INSERT/UPDATE/DELETE files only under their own
-- folder (first path segment = auth.uid()). Service-role and admin bypass via
-- separate policies below.

drop policy if exists driver_kyc_self_write on storage.objects;
create policy driver_kyc_self_write on storage.objects
  for all
  using (
    bucket_id = 'driver-kyc'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'driver-kyc'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists vehicle_docs_self_write on storage.objects;
create policy vehicle_docs_self_write on storage.objects
  for all
  using (
    bucket_id = 'vehicle-docs'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'vehicle-docs'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Admin-read: admins can SELECT (issue signed URLs) for any file in these
-- buckets. is_admin() is defined in migration 0002 with explicit search_path.

drop policy if exists driver_kyc_admin_read on storage.objects;
create policy driver_kyc_admin_read on storage.objects
  for select
  using (bucket_id = 'driver-kyc' and public.is_admin());

drop policy if exists vehicle_docs_admin_read on storage.objects;
create policy vehicle_docs_admin_read on storage.objects
  for select
  using (bucket_id = 'vehicle-docs' and public.is_admin());

-- Note: signed-URL TTL is enforced client-side at signing time (see
-- src/lib/photo/upload.ts in P2). Server-side, every read still goes through
-- one of the policies above; signed URLs piggyback on the issuing user's role.
