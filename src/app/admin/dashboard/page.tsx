/**
 * Admin Dashboard — ops health snapshot.
 * 6 KPI cards + recent ledger table + live alerts derived from DB stats.
 */
import { AlertTriangle } from 'lucide-react'

import { KpiCard } from '@/components/shared/kpi-card'
import { PageHeader } from '@/components/shared/page-header'
import { SectionShell } from '@/components/shared/section-shell'
import { getDashboardStats } from '@/lib/admin/queries-dashboard'

export const metadata = { title: 'Admin · Dashboard' }

type AlertItem = { key: string; message: string; severity: 'high' | 'medium' | 'low' }

function deriveAlerts(stats: Awaited<ReturnType<typeof getDashboardStats>>): AlertItem[] {
  const alerts: AlertItem[] = []

  if (stats.pendingKyc > 0) {
    alerts.push({
      key: 'kyc',
      message: `${stats.pendingKyc} driver KYC submission${stats.pendingKyc > 1 ? 's' : ''} pending review.`,
      severity: stats.pendingKyc >= 5 ? 'high' : 'medium',
    })
  }
  if (stats.pendingPayouts > 0) {
    alerts.push({
      key: 'payouts',
      message: `${stats.pendingPayouts} driver payout${stats.pendingPayouts > 1 ? 's' : ''} pending processing.`,
      severity: 'medium',
    })
  }
  if (alerts.length === 0) {
    alerts.push({
      key: 'clear',
      message: 'All queues clear. No pending actions required.',
      severity: 'low',
    })
  }
  return alerts
}

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats()

  const KPI_DATA = [
    { label: 'Active Drivers', value: stats.totalDrivers.toLocaleString() },
    { label: 'Active Campaigns', value: stats.activeCampaigns.toLocaleString() },
    { label: 'Pending KYC', value: stats.pendingKyc.toLocaleString() },
    { label: 'Active Partners', value: stats.activePartners.toLocaleString() },
    { label: 'Weekly KM', value: Math.round(stats.weeklyKmSum).toLocaleString() },
    { label: 'Pending Payouts', value: stats.pendingPayouts.toLocaleString() },
  ]

  return (
    <div className="space-y-8">
      <PageHeader kicker="Operations" title="Dashboard" />

      {/* KPI grid */}
      <section aria-label="Key metrics">
        <p className="mb-2 text-[11px] font-bold tracking-[2.5px] text-[#666666] uppercase">
          Key Metrics
        </p>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {KPI_DATA.map((kpi) => (
            <KpiCard key={kpi.label} label={kpi.label} value={kpi.value} />
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent ledger */}
        <SectionShell title="Recent Ledger" className="lg:col-span-2">
          {stats.recentLedger.length === 0 ? (
            <p className="py-6 text-center text-[13px] text-[#666666]">No ledger entries yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-[#cbccc9]">
                    {['Time', 'Kind', 'Amount (VND)'].map((h) => (
                      <th
                        key={h}
                        className="pr-4 pb-2 text-left text-[11px] font-extrabold tracking-[2.5px] text-[#666666] uppercase"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stats.recentLedger.map((row, i) => (
                    <tr key={row.id} className={i % 2 === 1 ? 'bg-[#f7f8fa]' : ''}>
                      <td className="py-2 pr-4 font-mono text-[12px] whitespace-nowrap text-[#666666]">
                        {row.ts.slice(0, 16).replace('T', ' ')}
                      </td>
                      <td className="py-2 pr-4 text-[#1a1a1a]">{row.kind.replace(/_/g, ' ')}</td>
                      <td className="py-2 font-mono text-[12px] text-[#1a1a1a]">
                        {row.amountVnd.toLocaleString('vi-VN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionShell>

        {/* Alerts — derived from live DB stats */}
        <SectionShell title="Alerts" variant="dark">
          <ul className="space-y-3">
            {deriveAlerts(stats).map((alert) => (
              <li key={alert.key} className="flex items-start gap-3">
                <AlertTriangle
                  className={`mt-0.5 size-4 shrink-0 ${alert.severity === 'high' ? 'text-red-400' : alert.severity === 'medium' ? 'text-yellow-400' : 'text-green-400'}`}
                  aria-hidden="true"
                />
                <p className="text-[13px] leading-[1.5] text-white/70">{alert.message}</p>
              </li>
            ))}
          </ul>
        </SectionShell>
      </div>
    </div>
  )
}
