import { cn } from '@/lib/utils'
import type { DriverInvoiceRow } from '@/lib/driver/queries-invoices'

const STATUS_STYLES: Record<DriverInvoiceRow['status'], string> = {
  requested: 'bg-blue-100 text-blue-700',
  reviewing: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  paid: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-600',
}

const STATUS_LABELS: Record<DriverInvoiceRow['status'], string> = {
  requested: 'Requested',
  reviewing: 'Reviewing',
  approved: 'Approved',
  paid: 'Paid',
  rejected: 'Rejected',
}

export function InvoiceListItem({ invoice }: { invoice: DriverInvoiceRow }) {
  const amountFormatted = invoice.amountVnd.toLocaleString('vi-VN')

  return (
    <details className="group open:ring-primary/20 rounded-md border border-[#cbccc9] bg-white open:ring-2">
      <summary
        className={[
          'flex cursor-pointer list-none items-center gap-3 px-4 py-3',
          'focus-visible:ring-primary focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset',
          'select-none',
        ].join(' ')}
        aria-label={`${invoice.invoiceNumber}: ${amountFormatted}₫ — ${STATUS_LABELS[invoice.status]}`}
      >
        <span className="font-heading text-[18px] leading-none text-[#1a1a1a] uppercase">
          {invoice.invoiceNumber}
        </span>
        <span className="text-[13px] text-[#666666]">
          {invoice.periodStart} → {invoice.periodEnd}
        </span>
        <span className="flex-1" />
        <span className="font-mono text-[14px] font-semibold text-[#1a1a1a]">
          {amountFormatted}₫
        </span>
        <span
          className={cn(
            'rounded px-2 py-0.5 text-[11px] font-bold tracking-[1px] uppercase',
            STATUS_STYLES[invoice.status],
          )}
        >
          {STATUS_LABELS[invoice.status]}
        </span>
        <span
          className="ml-1 text-[#666666] transition-transform group-open:rotate-180"
          aria-hidden="true"
        >
          ▾
        </span>
      </summary>

      <div className="grid gap-3 border-t border-[#cbccc9] px-4 py-3 text-[13px] sm:grid-cols-3">
        <Detail label="Requested" value={invoice.requestedAt.slice(0, 10)} />
        <Detail label="Period start" value={invoice.periodStart} />
        <Detail label="Period end" value={invoice.periodEnd} />
      </div>
    </details>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-bold tracking-[1.5px] text-[#666666] uppercase">{label}</p>
      <p className="font-mono text-[#1a1a1a]">{value}</p>
    </div>
  )
}
