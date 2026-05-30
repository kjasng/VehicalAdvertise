import 'server-only'

import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export type GpsPoint = { lat: number; lng: number; ts: string }

export type GpsTrail = {
  contractId: string
  driverName: string
  points: GpsPoint[]
}

// Supabase returns PostGIS geography columns as GeoJSON via PostgREST.
// Shape: { type: 'Point', coordinates: [lng, lat] }
function parseGeoJsonPoint(raw: unknown): { lat: number; lng: number } | null {
  if (!raw || typeof raw !== 'object') return null
  const obj = raw as Record<string, unknown>
  if (obj['type'] !== 'Point' || !Array.isArray(obj['coordinates'])) return null
  const [lng, lat] = obj['coordinates'] as number[]
  if (typeof lng !== 'number' || typeof lat !== 'number') return null
  return { lat, lng }
}

export async function getActiveGpsTrails(): Promise<GpsTrail[]> {
  const supabase = createSupabaseAdminClient()

  const { data: logs, error } = await supabase
    .from('gps_logs')
    .select('contract_id, ts, point')
    .gte('server_ts', new Date(Date.now() - 24 * 3_600_000).toISOString())
    .order('ts', { ascending: true })
    .limit(5_000) // cap for map render performance

  if (error || !logs?.length) return []

  // Group points by contract
  const byContract = new Map<string, GpsPoint[]>()
  for (const log of logs) {
    const coords = parseGeoJsonPoint(log.point)
    if (!coords) continue
    const existing = byContract.get(log.contract_id) ?? []
    existing.push({ ...coords, ts: log.ts })
    byContract.set(log.contract_id, existing)
  }

  if (!byContract.size) return []

  // Batch-fetch driver names via contracts
  const contractIds = [...byContract.keys()]
  const { data: contracts } = await supabase
    .from('contracts')
    .select('id, driver_id')
    .in('id', contractIds)

  const driverIds = [...new Set((contracts ?? []).map((c) => c.driver_id))]
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name')
    .in('id', driverIds)

  const nameById = Object.fromEntries((profiles ?? []).map((p) => [p.id, p.full_name]))
  const driverByContract = Object.fromEntries((contracts ?? []).map((c) => [c.id, c.driver_id]))

  return contractIds.map((contractId) => ({
    contractId,
    driverName: nameById[driverByContract[contractId]] ?? 'Unknown',
    points: byContract.get(contractId) ?? [],
  }))
}
