/**
 * Reports — period-filtered KM chart + CSV download cards.
 * Period controlled by ?period= URL param (week/month/prev_month/year).
 */
import { Download } from 'lucide-react'

import { WeeklyKmChart } from '@/components/admin/weekly-km-chart'
import { EmptyState } from '@/components/shared/empty-state'
import { PageHeader } from '@/components/shared/page-header'
import { SectionShell } from '@/components/shared/section-shell'
import { getReportsData, type ReportPeriod } from '@/lib/admin/queries-reports'

export const metadata = { title: 'Admin · Reports' }

const PERIOD_LABELS: Record<ReportPeriod, string> = {
  week: 'This Week',
  month: 'This Month',
  prev_month: 'Last Month',
  year: 'This Year',
}

const CSV_REPORTS = [
  {
    id: 'drivers',
    label: 'Drivers Report',
    description: 'All driver KYC statuses, phone, district, join date.',
  },
  {
    id: 'campaigns',
    label: 'Campaigns Report',
    description: 'Active / expired campaigns, partner, budget, dates.',
  },
  {
    id: 'invoices',
    label: 'Invoices Report',
    description: 'All ledger entries across driver / partner cohorts.',
  },
  {
    id: 'fraud',
    label: 'Fraud Signals Report',
    description: 'Photo verification failures and pending reviews.',
  },
]

interface PageProps {
  searchParams: Promise<{ period?: string }>
}

export default async function ReportsPage({ searchParams }: PageProps) {
  const { period: rawPeriod } = await searchParams
  const period: ReportPeriod =
    rawPeriod === 'month' || rawPeriod === 'prev_month' || rawPeriod === 'year' ? rawPeriod : 'week'

  const report = await getReportsData(period)

  const chartTitle =
    period === 'week'
      ? 'Daily KM — This Week'
      : period === 'month'
        ? 'Weekly KM — This Month'
        : period === 'prev_month'
          ? 'Weekly KM — Last Month'
          : 'Monthly KM — This Year'

  return (
    <div className="space-y-8">
      <PageHeader kicker="System" title="Reports" />

      {/* Period selector */}
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Report period">
        {(Object.keys(PERIOD_LABELS) as ReportPeriod[]).map((p) => (
          <a
            key={p}
            href={`/admin/reports?period=${p}`}
            role="tab"
            aria-selected={period === p}
            className={`rounded border px-3 py-1.5 text-[12px] font-bold tracking-[1px] uppercase transition-colors ${
              period === p
                ? 'border-[#1a1a1a] bg-[#1a1a1a] text-white'
                : 'border-[#cbccc9] bg-white text-[#666666] hover:border-[#1a1a1a] hover:text-[#1a1a1a]'
            }`}
          >
            {PERIOD_LABELS[p]}
          </a>
        ))}
      </div>

      {/* Summary stats */}
      <div className="flex flex-wrap gap-6 text-[13px] text-[#666666]">
        <span>
          <span className="font-bold text-[#1a1a1a]">{report.totalDrivers}</span> drivers
        </span>
        <span>
          <span className="font-bold text-[#1a1a1a]">{report.totalPartners}</span> partners
        </span>
        <span>
          <span className="font-bold text-[#1a1a1a]">{report.totalKmPeriod.toLocaleString()}</span>{' '}
          km in period
        </span>
        <span className="text-[#999]">
          {report.periodStart} → {report.periodEnd}
        </span>
      </div>

      {/* KM chart */}
      <SectionShell title={chartTitle}>
        {report.weeklyKm.length === 0 ? (
          <EmptyState
            kicker="empty"
            title="No Data"
            helper="KM data will appear once drivers are active."
          />
        ) : (
          <WeeklyKmChart data={report.weeklyKm} />
        )}
      </SectionShell>

      {/* CSV download cards */}
      <section>
        <p className="mb-3 text-[11px] font-bold tracking-[2.5px] text-[#666666] uppercase">
          CSV Exports (full data)
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {CSV_REPORTS.map((r) => (
            <a
              key={r.id}
              href={`/api/v1/admin/reports/${r.id}`}
              aria-label={`Download ${r.label} as CSV`}
              className="hover:border-primary hover:bg-primary/5 focus-visible:ring-primary flex items-start gap-4 rounded-md border border-[#cbccc9] bg-white p-5 transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              <span className="mt-0.5 rounded bg-[#f7f8fa] p-2.5">
                <Download className="text-primary size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="font-heading text-[18px] leading-none text-[#1a1a1a] uppercase">
                  {r.label}
                </p>
                <p className="mt-1.5 text-[13px] leading-[1.5] text-[#666666]">{r.description}</p>
                <p className="text-primary mt-2 text-[11px] font-bold tracking-[1px] uppercase">
                  Download CSV →
                </p>
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  )
}
