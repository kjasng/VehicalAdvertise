import 'server-only'

import { createSupabaseAdminClient } from '@/lib/supabase/admin'

import { batchSignUrls, gpsDelta } from './photo-query-utils'
export { getInstallProofs } from './queries-install-proofs'
export type { InstallProofPhoto, InstallProofRow } from './queries-install-proofs'

export type PhotoVerifRow = {
  id: string
  driverName: string
  promptDate: string
  signedPhotoUrl: string | null
  gpsDeltaM: number | null
  disposition: 'auto' | 'manual'
  dispositionResult: 'pass' | 'fail' | 'pending'
}

export async function getPhotoVerifications(): Promise<PhotoVerifRow[]> {
  const supabase = createSupabaseAdminClient()

  const { data: photos, error } = await supabase
    .from('photos')
    .select(
      'id, subject_id, storage_path, status, created_at, exif_lat, exif_lng, client_lat, client_lng',
    )
    .in('kind', ['periodic_vehicle', 'periodic_selfie'])
    .eq('status', 'pending') // only show actionable items in the review queue
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) {
    console.error('[getPhotoVerifications] photos query error:', error.message)
    return []
  }
  if (!photos?.length) return []

  // subject_type = 'driver' for periodic photos — subject_id is profile id
  const driverIds = [...new Set(photos.map((p) => p.subject_id))]
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name')
    .in('id', driverIds)

  const nameById = Object.fromEntries((profiles ?? []).map((p) => [p.id, p.full_name]))

  // Batch-sign all photo URLs in one Storage API call
  const signedByPath = await batchSignUrls(
    supabase,
    photos.map((p) => p.storage_path),
  )

  return photos.map((photo) => {
    const delta = gpsDelta(photo)
    // Disposition: auto if GPS coordinates present, manual otherwise
    const disposition = delta != null ? 'auto' : 'manual'
    // Pass/fail: auto-pass if delta < 100m, auto-fail if >= 100m, pending if no GPS data
    const dispositionResult: PhotoVerifRow['dispositionResult'] =
      delta == null ? 'pending' : delta < 100 ? 'pass' : 'fail'

    return {
      id: photo.id,
      driverName: nameById[photo.subject_id] ?? 'Unknown',
      promptDate: photo.created_at,
      signedPhotoUrl: signedByPath[photo.storage_path] ?? null,
      gpsDeltaM: delta,
      disposition,
      dispositionResult,
    }
  })
}
