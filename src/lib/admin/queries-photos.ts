import 'server-only'

import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export type InstallProofRow = {
  id: string
  driverName: string
  garageName: string
  submittedAt: string
  signedPhotoUrl: string | null
  gpsDeltaM: number | null
  status: 'pending' | 'approved' | 'rejected'
}

export type PhotoVerifRow = {
  id: string
  driverName: string
  promptDate: string
  signedPhotoUrl: string | null
  gpsDeltaM: number | null
  disposition: 'auto' | 'manual'
  dispositionResult: 'pass' | 'fail' | 'pending'
}

const SIGNED_URL_TTL_S = 900

// Haversine distance in metres between two lat/lng pairs.
// Used in place of PostGIS ST_Distance when coordinates are stored as plain
// numerics (photos.exif_lat/lng vs photos.client_lat/lng).
function haversineMetres(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6_371_000
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return Math.round(R * 2 * Math.asin(Math.sqrt(a)))
}

function gpsDelta(row: {
  exif_lat: number | null
  exif_lng: number | null
  client_lat: number | null
  client_lng: number | null
}): number | null {
  if (
    row.exif_lat == null ||
    row.exif_lng == null ||
    row.client_lat == null ||
    row.client_lng == null
  )
    return null
  return haversineMetres(
    Number(row.exif_lat),
    Number(row.exif_lng),
    Number(row.client_lat),
    Number(row.client_lng),
  )
}

// Batch-sign an array of storage paths and return a path→signedUrl map.
// Install proofs and periodic photos share the driver-kyc bucket for now.
// Update bucket name here when a dedicated bucket is created.
async function batchSignUrls(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  paths: string[],
): Promise<Record<string, string>> {
  if (!paths.length) return {}
  const { data, error } = await supabase.storage
    .from('driver-kyc')
    .createSignedUrls(paths, SIGNED_URL_TTL_S)
  if (error) console.error('[queries-photos] createSignedUrls error:', error.message)
  return Object.fromEntries(
    (data ?? []).filter((s) => s.signedUrl).map((s) => [s.path, s.signedUrl]),
  )
}

export async function getInstallProofs(): Promise<InstallProofRow[]> {
  const supabase = createSupabaseAdminClient()

  // subject_type = 'contract' for install proofs
  const { data: photos, error } = await supabase
    .from('photos')
    .select(
      'id, subject_id, storage_path, status, created_at, exif_lat, exif_lng, client_lat, client_lng',
    )
    .eq('kind', 'install_proof')
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) {
    console.error('[getInstallProofs] photos query error:', error.message)
    return []
  }
  if (!photos?.length) return []

  // Batch-fetch contracts for subject_ids
  const contractIds = [...new Set(photos.map((p) => p.subject_id))]
  const { data: contracts } = await supabase
    .from('contracts')
    .select('id, driver_id, install_garage_id')
    .in('id', contractIds)

  const contractMap = Object.fromEntries((contracts ?? []).map((c) => [c.id, c]))

  // Batch-fetch driver + garage names
  const driverIds = [...new Set((contracts ?? []).map((c) => c.driver_id).filter(Boolean))]
  const garageIds = [
    ...new Set(
      (contracts ?? []).map((c) => c.install_garage_id).filter((id): id is string => id != null),
    ),
  ]

  const [{ data: driverProfiles }, { data: garages }] = await Promise.all([
    supabase.from('profiles').select('id, full_name').in('id', driverIds),
    supabase.from('garages').select('id, shop_name').in('id', garageIds),
  ])

  const driverName = Object.fromEntries((driverProfiles ?? []).map((p) => [p.id, p.full_name]))
  const garageName = Object.fromEntries((garages ?? []).map((g) => [g.id, g.shop_name]))

  // Batch-sign all photo URLs in one Storage API call
  const signedByPath = await batchSignUrls(
    supabase,
    photos.map((p) => p.storage_path),
  )

  return photos.map((photo) => {
    const contract = contractMap[photo.subject_id]
    return {
      id: photo.id,
      driverName: contract ? (driverName[contract.driver_id] ?? 'Unknown') : 'Unknown',
      garageName: contract?.install_garage_id
        ? (garageName[contract.install_garage_id] ?? 'Unknown garage')
        : 'No garage',
      submittedAt: photo.created_at,
      signedPhotoUrl: signedByPath[photo.storage_path] ?? null,
      gpsDeltaM: gpsDelta(photo),
      status: photo.status as InstallProofRow['status'],
    }
  })
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
