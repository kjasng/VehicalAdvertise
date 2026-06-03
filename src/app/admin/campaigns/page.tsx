/**
 * Campaign Analytics — all campaigns with performance stats.
 * Shows burn %, km total, active drivers, QR scans per campaign.
 * Filter by status via ?status= URL param.
 */
import { PageHeader } from '@/components/shared/page-header'
import { SectionShell } from '@/components/shared/section-shell'
import { EmptyState } from '@/components/shared/empty-state'
import { getCampaignAnalytics } from '@/lib/admin/queries-campaigns-analytics'

import { CampaignFundingForm } from './campaign-funding-form'

export const metadata = { title: 'Admin · Campaigns' }

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-[#f0f0ee] text-[#666666]',
  submitted: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-blue-100 text-blue-700',
  awaiting_install: 'bg-orange-100 text-orange-700',
  active: 'bg-green-100 text-green-700',
  paused: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-[#f0f0ee] text-[#999]',
  rejected: 'bg-red-100 text-red-600',
  cancelled: 'bg-red-100 text-red-600',
}

const ALL_STATUSES = Object.keys(STATUS_STYLES)

interface PageProps {
  searchParams: Promise<{ status?: string }>
}

export default async function CampaignsPage({ searchParams }: PageProps) {
  const { status: filterStatus } = await searchParams
  const all = await getCampaignAnalytics()

  const rows = filterStatus ? all.filter((c) => c.status === filterStatus) : all

  return (
    <div className="space-y-6">
      <PageHeader kicker="Operations" title="Campaigns" />

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2">
        <a
          href="/admin/campaigns"
          className={`rounded border px-3 py-1.5 text-[12px] font-bold tracking-[1px] uppercase transition-colors ${
            !filterStatus
              ? 'border-[#1a1a1a] bg-[#1a1a1a] text-white'
              : 'border-[#cbccc9] bg-white text-[#666666] hover:border-[#1a1a1a] hover:text-[#1a1a1a]'
          }`}
        >
          All ({all.length})
        </a>
        {ALL_STATUSES.filter((s) => all.some((c) => c.status === s)).map((s) => (
          <a
            key={s}
            href={`/admin/campaigns?status=${s}`}
            className={`rounded border px-3 py-1.5 text-[12px] font-bold tracking-[1px] uppercase transition-colors ${
              filterStatus === s
                ? 'border-[#1a1a1a] bg-[#1a1a1a] text-white'
                : 'border-[#cbccc9] bg-white text-[#666666] hover:border-[#1a1a1a] hover:text-[#1a1a1a]'
            }`}
          >
            {s.replace(/_/g, ' ')} ({all.filter((c) => c.status === s).length})
          </a>
        ))}
      </div>

      <SectionShell title={`Campaigns (${rows.length})`}>
        {rows.length === 0 ? (
          <EmptyState
            kicker="empty"
            title="No Campaigns"
            helper="No campaigns match this filter."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead className="bg-[#f7f8fa]">
                <tr>
                  {[
                    'Campaign',
                    'Partner',
                    'Status',
                    'Dates',
                    'Budget Burn',
                    'Funding',
                    'KM',
                    'Drivers',
                    'QR Scans',
                  ].map((h) => (
                    <th
                      key={h}
                      className="border-b border-[#cbccc9] px-4 py-3 text-left text-[12px] font-extrabold tracking-[1.5px] text-[#1a1a1a] uppercase"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((c, i) => (
                  <tr
                    key={c.id}
                    className={`border-b border-[#cbccc9] last:border-0 ${i % 2 === 1 ? 'bg-[#f7f8fa]' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#1a1a1a]">{c.name}</p>
                    </td>
                    <td className="px-4 py-3 text-[#666666]">{c.partnerName}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-[11px] font-bold tracking-[1px] uppercase ${STATUS_STYLES[c.status] ?? ''}`}
                      >
                        {c.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-[#666666]">
                      <span className="whitespace-nowrap">
                        {c.startDate} →<br />
                        {c.endDate}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {/* Budget burn bar */}
                      <div className="min-w-[120px] space-y-1">
                        <div className="flex justify-between text-[11px] text-[#666666]">
                          <span>{c.spentVnd.toLocaleString('vi-VN')} ₫</span>
                          <span className="font-bold text-[#1a1a1a]">{c.burnPct}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-[#e8e8e6]">
                          <div
                            className={`h-1.5 rounded-full ${c.burnPct >= 90 ? 'bg-red-500' : c.burnPct >= 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                            style={{ width: `${Math.min(c.burnPct, 100)}%` }}
                          />
                        </div>
                        <p className="text-[11px] text-[#999]">
                          of {c.budgetVnd.toLocaleString('vi-VN')} ₫
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <CampaignFundingForm
                        campaignId={c.id}
                        fundingMode={c.fundingMode}
                        monthlyBudgetVnd={c.monthlyBudgetVnd}
                        balancePercent={c.balancePercent}
                        driverNetMonthlyVnd={c.driverNetMonthlyVnd}
                        platformFeePct={c.platformFeePct}
                        activeDriverLimit={c.activeDriverLimit}
                      />
                    </td>
                    <td className="px-4 py-3 font-mono text-[12px] font-bold text-[#1a1a1a]">
                      {c.kmTotal.toLocaleString()} km
                    </td>
                    <td className="px-4 py-3 text-center font-mono text-[13px] font-bold text-[#1a1a1a]">
                      {c.activeDrivers}
                    </td>
                    <td className="px-4 py-3 text-center font-mono text-[13px] text-[#666666]">
                      {c.qrScans.toLocaleString()}
                    </td>
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
