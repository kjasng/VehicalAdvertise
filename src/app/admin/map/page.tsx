import { MapSanity } from './map-sanity'

export const metadata = { title: 'Admin · Map sanity' }

export default function AdminMapPage() {
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold">Map sanity</h1>
        <p className="text-muted-foreground text-sm">
          MapLibre + OSM tiles + sample GPS trail. Internal page; not in the navigated chrome.
        </p>
      </header>
      <MapSanity />
    </div>
  )
}
