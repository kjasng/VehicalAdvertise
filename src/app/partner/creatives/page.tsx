/**
 * Partner Creatives — creative library with upload zone + grid.
 * CreativeUploadZone is a client component (drag/drop state).
 */
import { CreativeUploadZone } from '@/components/partner/creative-upload-zone'
import { PageHeader } from '@/components/shared/page-header'

export const metadata = { title: 'Partner · Creatives' }

export default function PartnerCreativesPage() {
  return (
    <div className="space-y-8">
      <PageHeader kicker="Assets" title="Creatives" />
      <CreativeUploadZone />
    </div>
  )
}
