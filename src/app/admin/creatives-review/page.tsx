/**
 * Creatives Review — campaign creative artwork review queue.
 * Server component: fetches real queue. Interactive drawer in CreativesQueueClient.
 */
import { PageHeader } from '@/components/shared/page-header'
import { getCreativesQueue } from '@/lib/admin/queries-creatives'

import { CreativesQueueClient } from './creatives-queue-client'

export const metadata = { title: 'Admin · Creatives Review' }

export default async function CreativesReviewPage() {
  const rows = await getCreativesQueue()

  return (
    <div className="space-y-6">
      <PageHeader kicker="Operations" title="Creatives Review" />
      <CreativesQueueClient rows={rows} />
    </div>
  )
}
