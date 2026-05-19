import 'server-only'

import { unstable_cache } from 'next/cache'

export type GeocodeHit = { lat: number; lng: number; address: string }

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'

async function fetchGeocode(query: string): Promise<GeocodeHit[]> {
  const url = new URL(NOMINATIM_URL)
  url.searchParams.set('q', query)
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('limit', '5')
  url.searchParams.set('countrycodes', 'vn')

  const res = await fetch(url, {
    headers: {
      // Nominatim's usage policy requires a descriptive user-agent.
      'User-Agent': 'wheels-earner/0.1 (contact: support@wheels-earner.local)',
      Accept: 'application/json',
    },
  })
  if (!res.ok) return []

  const data = (await res.json()) as Array<{
    lat: string
    lon: string
    display_name: string
  }>
  return data.map((row) => ({
    lat: Number(row.lat),
    lng: Number(row.lon),
    address: row.display_name,
  }))
}

/**
 * Cached geocode lookup. 24h cache; Nominatim's free tier is rate-limited.
 * Swap implementation (MapTiler / Mapbox) here without touching callers.
 */
export const geocode = unstable_cache(fetchGeocode, ['geocode'], {
  revalidate: 60 * 60 * 24,
  tags: ['geocode'],
})
