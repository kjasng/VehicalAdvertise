/**
 * Payouts — driver balance overview, payout creation, and SePay webhook log.
 * Three sections: Pending Balances · Payout History · SePay Events.
 */
import { PageHeader } from '@/components/shared/page-header'
import { SectionShell } from '@/components/shared/section-shell'
import { EmptyState } from '@/components/shared/empty-state'
import { getDriverBalances, getPayoutHistory, getSepayEvents } from '@/lib/admin/queries-payouts'

import { DriverBalancesTable, PayoutHistoryTable } from './payouts-client'

export const metadata = { title: 'Admin · Payouts' }

export default async function PayoutsPage() {
  const [balances, history, events] = await Promise.all([
    getDriverBalances(),
    getPayoutHistory(),
    getSepayEvents(),
  ])

  return (
    <div className="space-y-8">
      <PageHeader kicker="Money" title="Payouts" />

      {/* Pending driver balances */}
      <DriverBalancesTable balances={balances} />

      {/* Payout history */}
      <PayoutHistoryTable rows={history} />

      {/* SePay webhook events */}
      <SectionShell title={`SePay Events — Last 50 (${events.length})`} variant="dark">
        {events.length === 0 ? (
          <EmptyState
            kicker="empty"
            title="No Events"
            helper="SePay webhook events will appear here once the integration is live."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr>
                  {['TXN ID', 'Amount', 'Description', 'Received At', 'Processed', 'Error'].map(
                    (h) => (
                      <th
                        key={h}
                        className="border-b border-white/10 pr-4 pb-2 text-left text-[11px] font-extrabold tracking-[2px] text-white/50 uppercase"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {events.map((e, i) => (
                  <tr key={e.id} className={i % 2 === 1 ? 'bg-white/5' : ''}>
                    <td className="py-2 pr-4 font-mono text-[12px] text-white/70">{e.txnId}</td>
                    <td className="py-2 pr-4 font-mono text-[12px] text-white">
                      {e.amount != null ? e.amount.toLocaleString('vi-VN') + ' ₫' : '—'}
                    </td>
                    <td className="py-2 pr-4 text-[12px] text-white/70">{e.description ?? '—'}</td>
                    <td className="py-2 pr-4 font-mono text-[12px] whitespace-nowrap text-white/50">
                      {e.receivedAt.slice(0, 16).replace('T', ' ')}
                    </td>
                    <td className="py-2 pr-4">
                      {e.processedAt ? (
                        <span className="rounded bg-green-900/50 px-2 py-0.5 text-[11px] font-bold text-green-300">
                          ✓
                        </span>
                      ) : (
                        <span className="rounded bg-yellow-900/50 px-2 py-0.5 text-[11px] font-bold text-yellow-300">
                          pending
                        </span>
                      )}
                    </td>
                    <td className="py-2 text-[12px] text-red-400">{e.error ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionShell>
    </div>
  )
}
