/**
 * Driver Invoice — earnings history.
 * Vertical list of weekly payout rows.
 * Each row uses <details> for KISS expand/collapse with day breakdown.
 * Server component.
 */
import { InvoiceListItem } from '@/components/driver/invoice-list-item'
import { MOCK_DRIVER_WEEKLY_INVOICES } from '@/components/driver/mock-data'
import { EmptyState } from '@/components/shared/empty-state'
import { PageHeader } from '@/components/shared/page-header'

export const metadata = { title: 'Driver · Invoices' }

export default function DriverInvoicePage() {
  const invoices = MOCK_DRIVER_WEEKLY_INVOICES

  // Totals
  const totalPaid = invoices
    .filter((i) => i.status === 'paid')
    .reduce((acc, i) => acc + i.amountVnd, 0)

  return (
    <div className="mx-auto max-w-[480px] space-y-6">
      <PageHeader kicker="EARNINGS" title="Invoices" />

      {/* Summary pill */}
      <div className="flex items-center gap-3 rounded-md border border-[#cbccc9] bg-white px-4 py-3">
        <div>
          <p className="text-[11px] font-bold tracking-[2.5px] text-[#666666] uppercase">
            Total paid out
          </p>
          <p className="font-heading text-[28px] leading-none text-[#1a1a1a]">
            {totalPaid.toLocaleString('vi-VN')}
            <span className="font-heading ml-1 text-[14px] text-[#666666]">₫</span>
          </p>
        </div>
        <span className="ml-auto rounded bg-green-100 px-2 py-0.5 text-[11px] font-bold tracking-[1px] text-green-700 uppercase">
          Demo
        </span>
      </div>

      {/* Invoice list */}
      {invoices.length === 0 ? (
        <EmptyState
          kicker="NO INVOICES"
          title="Nothing here yet"
          helper="Your weekly payouts will appear here once your first campaign week closes."
        />
      ) : (
        <ul className="space-y-3" aria-label="Weekly invoices">
          {invoices.map((inv) => (
            <li key={inv.id}>
              <InvoiceListItem invoice={inv} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
