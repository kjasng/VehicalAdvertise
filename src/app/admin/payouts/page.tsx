/**
 * Payouts — driver balance overview, payout creation, and payout history.
 */
import { PageHeader } from '@/components/shared/page-header'
import { getDriverBalances, getPayoutHistory } from '@/lib/admin/queries-payouts'

import { DriverBalancesTable, PayoutHistoryTable } from './payouts-client'

export const metadata = { title: 'Admin · Payouts' }

export default async function PayoutsPage() {
  const [balances, history] = await Promise.all([getDriverBalances(), getPayoutHistory()])

  return (
    <div className="space-y-8">
      <PageHeader kicker="Money" title="Payouts" />

      {/* Pending driver balances */}
      <DriverBalancesTable balances={balances} />

      {/* Payout history */}
      <PayoutHistoryTable rows={history} />
    </div>
  )
}
