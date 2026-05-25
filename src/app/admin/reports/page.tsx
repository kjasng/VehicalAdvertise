/**
 * Reports — CSV download cards + weekly km line chart.
 * Chart is client-side (recharts); download cards are static links (stub hrefs).
 */
import { Download } from 'lucide-react'

import { DemoBadge } from '@/components/admin/demo-badge'
import { WeeklyKmChart } from '@/components/admin/weekly-km-chart'
import { PageHeader } from '@/components/shared/page-header'
import { SectionShell } from '@/components/shared/section-shell'

export const metadata = { title: 'Admin · Reports' }

const CSV_REPORTS = [
  {
    id: 'drivers',
    label: 'Drivers Report',
    description: 'All driver KYC statuses, km totals, payout history.',
    href: '#',
  },
  {
    id: 'campaigns',
    label: 'Campaigns Report',
    description: 'Active / expired campaigns, impressions, budget burn.',
    href: '#',
  },
  {
    id: 'invoices',
    label: 'Invoices Report',
    description: 'All invoices across driver / partner / garage cohorts.',
    href: '#',
  },
  {
    id: 'fraud',
    label: 'Fraud Signals Report',
    description: 'GPS anomalies, photo verification failures, manual overrides.',
    href: '#',
  },
]

export default function ReportsPage() {
  return (
    <div className="space-y-8">
      <PageHeader kicker="System" title="Reports" />

      {/* CSV download cards */}
      <section>
        <p className="mb-3 text-[11px] font-bold tracking-[1.5px] text-[#666666] uppercase">
          CSV Exports
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {CSV_REPORTS.map((r) => (
            <a
              key={r.id}
              href={r.href}
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

      {/* Weekly km chart */}
      <SectionShell title="Weekly KM — Last 12 Weeks" action={<DemoBadge />}>
        <WeeklyKmChart />
      </SectionShell>
    </div>
  )
}
