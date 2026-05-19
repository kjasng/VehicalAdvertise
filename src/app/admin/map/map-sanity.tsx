'use client'

import dynamic from 'next/dynamic'

import type { TrailPoint } from '@/lib/map/trail'

// Dynamically import the map so MapLibre's ~250KB bundle stays out of the
// non-map routes' JS payload.
const BaseMap = dynamic(() => import('@/components/map/base-map').then((m) => m.BaseMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-[60vh] w-full items-center justify-center rounded-lg border bg-zinc-50 text-sm text-zinc-500 dark:bg-zinc-950">
      Loading map…
    </div>
  ),
})

const GpsTrail = dynamic(() => import('@/components/map/gps-trail').then((m) => m.GpsTrail), {
  ssr: false,
})

const HANOI_LOOP: TrailPoint[] = [
  { lng: 105.852, lat: 21.0285, ts: '2026-05-19T00:00:00Z' },
  { lng: 105.857, lat: 21.0301, ts: '2026-05-19T00:01:00Z' },
  { lng: 105.862, lat: 21.0327, ts: '2026-05-19T00:02:00Z' },
  { lng: 105.86, lat: 21.0365, ts: '2026-05-19T00:03:00Z' },
  { lng: 105.853, lat: 21.0378, ts: '2026-05-19T00:04:00Z' },
  { lng: 105.847, lat: 21.0356, ts: '2026-05-19T00:05:00Z' },
  { lng: 105.85, lat: 21.0305, ts: '2026-05-19T00:06:00Z' },
]

export function MapSanity() {
  return (
    <BaseMap>
      <GpsTrail points={HANOI_LOOP} />
    </BaseMap>
  )
}
