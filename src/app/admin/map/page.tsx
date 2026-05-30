/**
 * Admin Map — live ops map. Shows GPS trails from last 24h.
 * Server component passes real trails to MapSanity client component.
 */
import { PageHeader } from '@/components/shared/page-header'
import { SectionShell } from '@/components/shared/section-shell'
import { getActiveGpsTrails } from '@/lib/admin/queries-map'

import { MapSanity } from './map-sanity'

export const metadata = { title: 'Admin · Live Ops Map' }

export default async function AdminMapPage() {
  const trails = await getActiveGpsTrails()

  return (
    <div className="space-y-6">
      <PageHeader kicker="System" title="Live Ops Map" />
      <SectionShell title={`GPS Trails — Last 24h (${trails.length} active)`}>
        <MapSanity trails={trails} />
      </SectionShell>
    </div>
  )
}
