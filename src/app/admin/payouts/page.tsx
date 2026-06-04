/**
 * Payouts — driver balance overview, payout creation, and payout history.
 */
import { PageHeader } from '@/components/shared/page-header'
import {
  getDriverBalances,
  getGarageWithdrawalHistory,
  getPayoutHistory,
} from '@/lib/admin/queries-payouts'

import { GarageWithdrawalsTable } from './garage-withdrawals-table'
import { DriverBalancesTable, PayoutHistoryTable } from './payouts-client'

export const metadata = { title: 'Admin · Payouts' }

export default async function PayoutsPage() {
  const [balances, history, garageWithdrawals] = await Promise.all([
    getDriverBalances(),
    getPayoutHistory(),
    getGarageWithdrawalHistory(),
  ])

  return (
    <div className="space-y-8">
      <PageHeader kicker="Money" title="Payouts" />

      {/* Driver-created withdrawal invoices awaiting admin approval */}
      <DriverBalancesTable balances={balances} />

      <GarageWithdrawalsTable rows={garageWithdrawals} />

      {/* Payout history */}
      <PayoutHistoryTable rows={history} />
    </div>
  )
}
