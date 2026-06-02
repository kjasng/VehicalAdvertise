/**
 * Ledger Adjustments — manual adjustment/refund entries for SePay disputes.
 * Admin credits/debits a partner or driver and the change is recorded in the ledger.
 */
import { PageHeader } from '@/components/shared/page-header'
import { getLedgerTargets, getRecentAdjustments } from '@/lib/admin/queries-ledger-adjustments'

import { LedgerAdjustmentsClient } from './ledger-adjustments-client'

export const metadata = { title: 'Admin · Ledger Adjustments' }

export default async function LedgerAdjustmentsPage() {
  const [history, targets] = await Promise.all([getRecentAdjustments(), getLedgerTargets()])

  return (
    <div className="space-y-6">
      <PageHeader kicker="Money" title="Ledger Adjustments" />
      <LedgerAdjustmentsClient history={history} targets={targets} />
    </div>
  )
}
