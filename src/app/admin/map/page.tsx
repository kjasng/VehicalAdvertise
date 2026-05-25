/**
 * Admin Map — live ops map page.
 * Wraps existing MapLibre embed in pencil-style PageHeader + SectionShell.
 * MapLibre internals are untouched (MapSanity component).
 */
import { MapSanity } from './map-sanity'

import { PageHeader } from '@/components/shared/page-header'
import { SectionShell } from '@/components/shared/section-shell'

export const metadata = { title: 'Admin · Live Ops Map' }

export default function AdminMapPage() {
  return (
    <div className="space-y-6">
      <PageHeader kicker="System" title="Live Ops Map" />
      <SectionShell title="GPS Trail — Hanoi">
        <MapSanity />
      </SectionShell>
    </div>
  )
}
