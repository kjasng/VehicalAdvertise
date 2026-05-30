/**
 * Drivers KYC — pending profile review queue.
 * Server component: fetches real KYC queue. Interactive drawer in KycQueueClient.
 */
import { PageHeader } from '@/components/shared/page-header'
import { getKycQueue } from '@/lib/admin/queries-kyc'

import { KycQueueClient } from './kyc-queue-client'

export const metadata = { title: 'Admin · Drivers KYC' }

export default async function DriversKycPage() {
  const rows = await getKycQueue()

  return (
    <div className="space-y-6">
      <PageHeader kicker="Operations" title="Drivers KYC" />
      <KycQueueClient rows={rows} />
    </div>
  )
}
