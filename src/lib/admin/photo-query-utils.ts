import 'server-only'

import { createSupabaseAdminClient } from '@/lib/supabase/admin'

const SIGNED_URL_TTL_S = 900

export function gpsDelta(row: {
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
  ) {
    return null
  }
  return haversineMetres(
    Number(row.exif_lat),
    Number(row.exif_lng),
    Number(row.client_lat),
    Number(row.client_lng),
  )
}

export async function batchSignUrls(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  paths: string[],
): Promise<Record<string, string>> {
  if (!paths.length) return {}
  const { data, error } = await supabase.storage
    .from('driver-kyc')
    .createSignedUrls(paths, SIGNED_URL_TTL_S)
  if (error) console.error('[photo-query-utils] createSignedUrls error:', error.message)
  return Object.fromEntries(
    (data ?? [])
      .filter((signed) => signed.signedUrl)
      .map((signed) => [signed.path, signed.signedUrl]),
  )
}

function haversineMetres(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6_371_000
  const toRad = (value: number) => (value * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return Math.round(R * 2 * Math.asin(Math.sqrt(a)))
}
