import { Download } from 'lucide-react'

import { MonthlyFinanceTable } from '@/components/admin/monthly-finance-table'
import { KpiCard } from '@/components/shared/kpi-card'
import { PageHeader } from '@/components/shared/page-header'
import { SectionShell } from '@/components/shared/section-shell'
import { getReportsData } from '@/lib/admin/queries-reports'

export const metadata = { title: 'Admin · Invoice Reports' }

const EXPORTS = [
  {
    id: 'driver-invoices',
    label: 'Driver Invoices',
    description: 'Monthly driver withdrawal invoices and payout status.',
  },
  {
    id: 'partner-invoices',
    label: 'Partner Invoices',
    description: 'Monthly recognized campaign charges by partner.',
  },
  {
    id: 'garage-invoices',
    label: 'Garage Invoices',
    description: 'Monthly garage withdrawal invoices and payout status.',
  },
  {
    id: 'net-profit',
    label: 'Net Profit',
    description: 'Partner received minus driver and garage payouts.',
  },
]

interface PageProps {
  searchParams: Promise<{ month?: string }>
}

export default async function ReportsPage({ searchParams }: PageProps) {
  const { month } = await searchParams
  const report = await getReportsData(month)

  return (
    <div className="space-y-8">
      <PageHeader kicker="Invoices" title="Reports" />

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-[11px] font-bold tracking-[2.5px] text-[#666666] uppercase">
          Month
        </span>
        {report.monthOptions.map((option) => (
          <a
            key={option}
            href={`/admin/reports?month=${option}`}
            className={`rounded border px-3 py-1.5 text-[12px] font-bold tracking-[1px] uppercase transition-colors ${
              report.selectedMonth === option
                ? 'border-[#1a1a1a] bg-[#1a1a1a] text-white'
                : 'border-[#cbccc9] bg-white text-[#666666] hover:border-[#1a1a1a] hover:text-[#1a1a1a]'
            }`}
          >
            {option}
          </a>
        ))}
      </div>

      <section>
        <p className="mb-3 text-[11px] font-bold tracking-[2.5px] text-[#666666] uppercase">
          Financial Overview — Period
        </p>
        <div className="mb-3 text-[13px] text-[#999]">
          {report.periodStart} → {report.periodEnd}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <KpiCard label="Paid to drivers" value={formatVnd(report.totals.driverPaidVnd)} />
          <KpiCard
            label="Received from partners"
            value={formatVnd(report.totals.partnerReceivedVnd)}
          />
          <KpiCard label="Paid to garages" value={formatVnd(report.totals.garagePaidVnd)} />
          <KpiCard label="Net profit" value={formatVnd(report.totals.netProfitVnd)} />
        </div>
      </section>

      <SectionShell title="Monthly Finance">
        <MonthlyFinanceTable rows={report.monthlyFinance} />
      </SectionShell>

      <section>
        <p className="mb-3 text-[11px] font-bold tracking-[2.5px] text-[#666666] uppercase">
          Invoice Exports
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {EXPORTS.map((item) => (
            <a
              key={item.id}
              href={`/api/v1/admin/reports/${item.id}?month=${report.selectedMonth}`}
              aria-label={`Download ${item.label} CSV`}
              className="hover:border-primary hover:bg-primary/5 focus-visible:ring-primary flex items-start gap-4 rounded-md border border-[#cbccc9] bg-white p-5 transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              <span className="mt-0.5 rounded bg-[#f7f8fa] p-2.5">
                <Download className="text-primary size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="font-heading text-[18px] leading-none text-[#1a1a1a] uppercase">
                  {item.label}
                </p>
                <p className="mt-1.5 text-[13px] leading-[1.5] text-[#666666]">
                  {item.description}
                </p>
                <p className="text-primary mt-2 text-[11px] font-bold tracking-[1px] uppercase">
                  Download CSV
                </p>
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  )
}

function formatVnd(amount: number) {
  return `${amount.toLocaleString('vi-VN')} ₫`
}
