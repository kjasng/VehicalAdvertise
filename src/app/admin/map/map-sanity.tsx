'use client'

import dynamic from 'next/dynamic'

import type { GpsTrail } from '@/lib/admin/queries-map'

// Dynamically import the map so MapLibre's ~250KB bundle stays out of the
// non-map routes' JS payload.
const BaseMap = dynamic(() => import('@/components/map/base-map').then((m) => m.BaseMap), {
  ssr: false,
  loading: () => (
    <div className="bg-background text-muted-foreground flex h-[60vh] w-full items-center justify-center rounded-lg border text-sm">
      Loading map…
    </div>
  ),
})

const GpsTrailLayer = dynamic(() => import('@/components/map/gps-trail').then((m) => m.GpsTrail), {
  ssr: false,
})

interface MapSanityProps {
  trails: GpsTrail[]
}

export function MapSanity({ trails }: MapSanityProps) {
  return (
    <div className="relative">
      <BaseMap>
        {trails.map((trail) => (
          <GpsTrailLayer key={trail.contractId} points={trail.points} />
        ))}
      </BaseMap>

      {trails.length === 0 && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <p className="rounded bg-white/90 px-4 py-2 text-[13px] text-[#666666]">
            No active GPS trails in last 24h
          </p>
        </div>
      )}
    </div>
  )
}
