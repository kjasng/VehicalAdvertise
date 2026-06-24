import Link from 'next/link'
import { redirect } from 'next/navigation'

import { CreateInvoiceButton } from '@/components/driver/create-invoice-button'
import { InvoiceListItem } from '@/components/driver/invoice-list-item'
import { EmptyState } from '@/components/shared/empty-state'
import { PageHeader } from '@/components/shared/page-header'
import { SectionShell } from '@/components/shared/section-shell'
import { formatVnd } from '@/lib/driver/monthly-earning'
import { getDriverInvoicePageData } from '@/lib/driver/queries-invoices'

export const metadata = { title: 'Driver · Invoices' }

export default async function DriverInvoicePage() {
  const data = await getDriverInvoicePageData()
  if (!data) redirect('/login')

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="EARNINGS"
        title="Invoices"
        cta={
          <CreateInvoiceButton
            disabled={!data.canCreateInvoice}
            amountVnd={data.earningPeriod?.driverNetVnd}
            periodStart={data.completedPeriod?.start}
            periodEnd={data.completedPeriod?.end}
            bankInfo={data.bankInfo}
          />
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Metric label="Total paid out" value={formatVnd(data.totalPaidVnd)} />
        <Metric
          label="Current period"
          value={
            data.currentPeriod ? `${data.currentPeriod.start} → ${data.currentPeriod.end}` : '—'
          }
        />
        <Metric
          label={data.canCreateInvoice ? 'Available for withdrawal' : 'Latest period'}
          value={
            data.earningPeriod ? formatVnd(data.earningPeriod.driverNetVnd) : 'Not available yet'
          }
        />
      </div>

      {data.blockedReason && (
        <section className="rounded-md border border-[#cbccc9] bg-white p-4">
          <p className="text-[11px] font-bold tracking-[2.5px] text-[#666666] uppercase">
            Invoice status
          </p>
          <p className="mt-1 text-[14px] text-[#1a1a1a]">{data.blockedReason}</p>
          {!data.payoutSettingsComplete && (
            <Link
              href="/driver/profile"
              className="mt-3 inline-flex h-10 items-center rounded bg-[#1a1a1a] px-4 text-[12px] font-bold tracking-[1px] text-white uppercase hover:bg-[#333]"
            >
              Complete payout settings
            </Link>
          )}
        </section>
      )}

      <SectionShell title="Monthly withdrawal invoices">
        {data.invoices.length === 0 ? (
          <EmptyState
            kicker="NO INVOICES"
            title="Nothing here yet"
            helper="Your monthly withdrawal invoices will appear here after a completed earning period."
          />
        ) : (
          <ul className="space-y-3" aria-label="Monthly invoices">
            {data.invoices.map((invoice) => (
              <li key={invoice.id}>
                <InvoiceListItem invoice={invoice} />
              </li>
            ))}
          </ul>
        )}
      </SectionShell>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-[#cbccc9] bg-white px-4 py-3">
      <p className="text-[11px] font-bold tracking-[2.5px] text-[#666666] uppercase">{label}</p>
      <p className="font-heading mt-1 text-[26px] leading-none text-[#1a1a1a] uppercase">{value}</p>
    </div>
  )
}
