import 'server-only'

import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export type KycQueueRow = {
  id: string
  fullName: string
  email: string | null
  phone: string | null
  submittedAt: string
  kycStatus: 'pending' | 'approved' | 'rejected'
  district: string | null
  bodyType: string | null
  signedFront: string | null
  signedBack: string | null
  signedSelfie: string | null
}

const SIGNED_URL_TTL_S = 900 // 15 min

export async function getKycQueue(): Promise<KycQueueRow[]> {
  const supabase = createSupabaseAdminClient()

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select(
      'id, full_name, email, phone_e164, kyc_status, created_at, drivers(primary_city, body_type)',
    )
    .eq('role', 'driver')
    .eq('kyc_status', 'pending')
    .order('created_at', { ascending: true })
    .limit(200)

  if (error) {
    console.error('[getKycQueue] profiles query error:', error.message)
    return []
  }
  if (!profiles?.length) return []

  // Batch-fetch ALL photos for pending drivers in a single query
  const driverIds = profiles.map((p) => p.id)
  const { data: photos, error: photoErr } = await supabase
    .from('photos')
    .select('subject_id, kind, storage_path')
    .in('subject_id', driverIds)
    .in('kind', ['kyc_cccd_front', 'kyc_cccd_back', 'kyc_selfie'])

  if (photoErr) console.error('[getKycQueue] photos query error:', photoErr.message)

  const photoRows = photos ?? []

  // Batch-sign all paths in one Storage API call
  const paths = photoRows.map((p) => p.storage_path)
  let signedByPath: Record<string, string> = {}

  if (paths.length) {
    const { data: signedData, error: signErr } = await supabase.storage
      .from('driver-kyc')
      .createSignedUrls(paths, SIGNED_URL_TTL_S)
    if (signErr) console.error('[getKycQueue] createSignedUrls error:', signErr.message)
    signedByPath = Object.fromEntries(
      (signedData ?? []).filter((s) => s.signedUrl).map((s) => [s.path, s.signedUrl]),
    )
  }

  // Build lookup: driverId → { kind → signedUrl }
  const photosByDriver: Record<string, Record<string, string | null>> = {}
  for (const photo of photoRows) {
    const bucket = photosByDriver[photo.subject_id] ?? {}
    bucket[photo.kind] = signedByPath[photo.storage_path] ?? null
    photosByDriver[photo.subject_id] = bucket
  }

  return profiles.map((profile) => {
    const urls = photosByDriver[profile.id] ?? {}
    const driverRow = Array.isArray(profile.drivers) ? profile.drivers[0] : profile.drivers

    return {
      id: profile.id,
      fullName: profile.full_name,
      email: profile.email,
      phone: profile.phone_e164,
      submittedAt: profile.created_at,
      kycStatus: profile.kyc_status as KycQueueRow['kycStatus'],
      district: driverRow?.primary_city ?? null,
      bodyType: (driverRow as { body_type?: string | null } | null)?.body_type ?? null,
      signedFront: urls['kyc_cccd_front'] ?? null,
      signedBack: urls['kyc_cccd_back'] ?? null,
      signedSelfie: urls['kyc_selfie'] ?? null,
    }
  })
}
