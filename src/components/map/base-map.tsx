'use client'

import 'maplibre-gl/dist/maplibre-gl.css'

import { Map, AttributionControl, NavigationControl } from 'react-map-gl/maplibre'
import type { ReactNode } from 'react'

import { HANOI_CENTER, OSM_RASTER_STYLE } from '@/lib/map/style'

type Props = {
  initial?: { lng: number; lat: number; zoom: number }
  className?: string
  children?: ReactNode
}

export function BaseMap({
  initial = HANOI_CENTER,
  className = 'h-[60vh] w-full overflow-hidden rounded-lg border',
  children,
}: Props) {
  return (
    <div className={className}>
      <Map
        initialViewState={initial}
        mapStyle={OSM_RASTER_STYLE}
        attributionControl={false}
        style={{ width: '100%', height: '100%' }}
      >
        <AttributionControl compact position="bottom-right" />
        <NavigationControl position="top-right" />
        {children}
      </Map>
    </div>
  )
}
