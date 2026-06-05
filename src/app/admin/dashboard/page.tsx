/**
 * Admin Dashboard — ops health snapshot.
 * 6 KPI cards + recent operational requests.
 */
import Link from 'next/link'

import { KpiCard } from '@/components/shared/kpi-card'
import { PageHeader } from '@/components/shared/page-header'
import { SectionShell } from '@/components/shared/section-shell'
import { getDashboardStats } from '@/lib/admin/queries-dashboard'

export const metadata = { title: 'Admin · Dashboard' }

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

      <SectionShell title="Recent Requests">
        {stats.recentRequests.length === 0 ? (
          <p className="py-6 text-center text-[13px] text-[#666666]">No recent requests.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-[#cbccc9]">
                  {['Time', 'Request', 'Actor', 'Amount', 'Status'].map((heading) => (
                    <th
                      key={heading}
                      className="pr-4 pb-2 text-left text-[11px] font-extrabold tracking-[2.5px] text-[#666666] uppercase"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.recentRequests.map((row, i) => (
                  <tr key={`${row.type}-${row.id}`} className={i % 2 === 1 ? 'bg-[#f7f8fa]' : ''}>
                    <td className="py-2 pr-4 font-mono text-[12px] whitespace-nowrap text-black">
                      {new Date(row.createdAt).toLocaleString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-2 pr-4">
                      <Link href={row.href} className="font-medium text-[#1a1a1a] hover:underline">
                        {row.type.replace(/_/g, ' ')}
                      </Link>
                    </td>
                    <td className="py-2 pr-4 text-[#1a1a1a]">{row.actorName}</td>
                    <td className="py-2 pr-4 font-mono text-[12px] text-[#1a1a1a]">
                      {row.amountVnd ? `${row.amountVnd.toLocaleString('vi-VN')} ₫` : '—'}
                    </td>
                    <td className="py-2 font-mono text-[12px] text-[#666666]">{row.status}</td>
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
