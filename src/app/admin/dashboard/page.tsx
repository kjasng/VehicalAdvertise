/**
 * Admin Dashboard — ops health snapshot.
 * 6 KPI cards + recent ledger table + alerts section.
 * All data mocked; DEMO badge shown in non-production.
 */
import { AlertTriangle } from 'lucide-react'

import { DemoBadge } from '@/components/admin/demo-badge'
import { MOCK_KYC_ROWS, MOCK_LEDGER_ROWS } from '@/components/admin/mock-data'
import { KpiCard } from '@/components/shared/kpi-card'
import { PageHeader } from '@/components/shared/page-header'
import { SectionShell } from '@/components/shared/section-shell'

export const metadata = { title: 'Admin · Dashboard' }

const KPI_DATA = [
  { label: 'Active Drivers', value: '1,248', delta: '8.2', deltaDirection: 'up' as const },
  { label: 'Active Campaigns', value: '34', delta: '2', deltaDirection: 'up' as const },
  { label: 'Pending KYC', value: String(MOCK_KYC_ROWS.length) },
  { label: 'Pending Creatives', value: '4' },
  { label: 'Today Payout (VND)', value: '84M', delta: '12', deltaDirection: 'up' as const },
  { label: 'Fraud Signals 24h', value: '2', delta: '1', deltaDirection: 'down' as const },
]

const ALERTS = [
  { id: 1, message: 'Driver pv-004 flagged: GPS delta 500m on 2026-05-24', severity: 'high' },
  { id: 2, message: 'Invoice inv-d-004 overdue — Phạm Minh Tuấn W20', severity: 'medium' },
  { id: 3, message: 'Invoice inv-p-004 overdue — M_Service Apr', severity: 'medium' },
]

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader kicker="Operations" title="Dashboard" />

      {/* KPI grid */}
      <section aria-label="Key metrics">
        <div className="mb-2 flex items-center gap-2">
          <p className="text-[11px] font-bold tracking-[1.5px] text-[#666666] uppercase">
            Key Metrics
          </p>
          <DemoBadge />
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {KPI_DATA.map((kpi) => (
            <KpiCard
              key={kpi.label}
              label={kpi.label}
              value={kpi.value}
              delta={kpi.delta}
              deltaDirection={kpi.deltaDirection}
            />
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent ledger */}
        <SectionShell title="Recent Ledger" className="lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-[#cbccc9]">
                  {['Time', 'Description', 'Amount (VND)', 'Dir'].map((h) => (
                    <th
                      key={h}
                      className="pr-4 pb-2 text-left text-[11px] font-extrabold tracking-[1.5px] text-[#666666] uppercase"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MOCK_LEDGER_ROWS.map((row, i) => (
                  <tr key={row.id} className={i % 2 === 1 ? 'bg-[#f7f8fa]' : ''}>
                    <td className="py-2 pr-4 font-mono text-[12px] whitespace-nowrap text-[#666666]">
                      {row.ts}
                    </td>
                    <td className="py-2 pr-4 text-[#1a1a1a]">{row.description}</td>
                    <td className="py-2 pr-4 font-mono text-[12px] text-[#1a1a1a]">
                      {row.amountVnd.toLocaleString('vi-VN')}
                    </td>
                    <td className="py-2">
                      <span
                        className={`inline-block rounded px-1.5 py-0.5 text-[11px] font-bold uppercase ${row.direction === 'credit' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}
                      >
                        {row.direction}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionShell>

        {/* Alerts */}
        <SectionShell title="Alerts" variant="dark">
          <ul className="space-y-3">
            {ALERTS.map((alert) => (
              <li key={alert.id} className="flex items-start gap-3">
                <AlertTriangle
                  className={`mt-0.5 size-4 shrink-0 ${alert.severity === 'high' ? 'text-red-400' : 'text-yellow-400'}`}
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
