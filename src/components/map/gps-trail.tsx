'use client'

import { Layer, Source } from 'react-map-gl/maplibre'

import { pointsToGeoJsonLine, type TrailPoint } from '@/lib/map/trail'

type Props = {
  points: TrailPoint[]
  color?: string
  width?: number
}

export function GpsTrail({ points, color = '#ff5c00', width = 4 }: Props) {
  const feature = pointsToGeoJsonLine(points)
  return (
    <Source id="gps-trail" type="geojson" data={feature}>
      <Layer
        id="gps-trail-line"
        type="line"
        paint={{
          'line-color': color,
          'line-width': width,
          'line-opacity': 0.9,
        }}
        layout={{
          'line-cap': 'round',
          'line-join': 'round',
        }}
      />
    </Source>
  )
}
