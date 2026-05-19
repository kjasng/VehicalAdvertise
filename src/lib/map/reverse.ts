import 'server-only'

import { unstable_cache } from 'next/cache'

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/reverse'

async function fetchReverse(lat: number, lng: number): Promise<string | null> {
  const url = new URL(NOMINATIM_URL)
  url.searchParams.set('lat', String(lat))
  url.searchParams.set('lon', String(lng))
  url.searchParams.set('format', 'jsonv2')

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'wheels-earner/0.1 (contact: support@wheels-earner.local)',
      Accept: 'application/json',
    },
  })
  if (!res.ok) return null

  const data = (await res.json()) as { display_name?: string }
  return data.display_name ?? null
}

export const reverseGeocode = unstable_cache(fetchReverse, ['reverse-geocode'], {
  revalidate: 60 * 60 * 24,
  tags: ['reverse-geocode'],
})
