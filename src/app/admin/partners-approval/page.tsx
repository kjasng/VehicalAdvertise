/**
 * Partner Approvals — review partner company applications.
 * Delegates to PartnerApprovalQueueClient for drawer + approve/reject UI.
 */
import { PageHeader } from '@/components/shared/page-header'
import { getPartnerApprovalQueue } from '@/lib/admin/queries-partners-approval'

import { PartnerApprovalQueueClient } from './partner-approval-queue-client'

export const metadata = { title: 'Admin · Partner Approvals' }

export default async function PartnerApprovalsPage() {
  const rows = await getPartnerApprovalQueue()

  return (
    <div className="space-y-6">
      <PageHeader kicker="Operations" title="Partner Approvals" />
      <PartnerApprovalQueueClient rows={rows} />
    </div>
  )
}
