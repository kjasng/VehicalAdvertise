export type TrailPoint = { lat: number; lng: number; ts: string }

type LineStringFeature = {
  type: 'Feature'
  properties: Record<string, unknown>
  geometry: {
    type: 'LineString'
    coordinates: [number, number][]
  }
}

/**
 * Convert an ordered list of `{lat, lng, ts}` points to a GeoJSON LineString
 * feature. Empty / single-point inputs return a feature with zero or one coord
 * (MapLibre handles both — degenerate features simply render no line).
 */
export function pointsToGeoJsonLine(points: TrailPoint[]): LineStringFeature {
  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: points.map((p) => [p.lng, p.lat]),
    },
  }
}
