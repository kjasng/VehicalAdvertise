import type { StyleSpecification } from 'maplibre-gl'

/**
 * Free OSM raster style. No API key required.
 * Attribution per OSM tile usage policy is rendered by react-map-gl's
 * <AttributionControl/> below.
 */
export const OSM_RASTER_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: [
        'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    },
  },
  layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
}

export const HANOI_CENTER = { lng: 105.8542, lat: 21.0285, zoom: 11 } as const
