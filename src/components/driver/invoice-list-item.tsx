/**
 * InvoiceListItem — server component.
 * Single weekly payout row rendered as a <details> element for KISS expand/collapse.
 * Compact: week label (Anton 18px) + km + VND amount + status pill.
 */
import { cn } from '@/lib/utils'

import type { DriverInvoiceRow, DriverInvoiceStatus } from './mock-data'

const STATUS_STYLES: Record<DriverInvoiceStatus, string> = {
  paid: 'bg-green-100 text-green-700',
  issued: 'bg-blue-100 text-blue-700',
  draft: 'bg-[#f0f0ee] text-[#666666]',
  overdue: 'bg-red-100 text-red-600',
}

const STATUS_LABELS: Record<DriverInvoiceStatus, string> = {
  paid: 'Paid',
  issued: 'Issued',
  draft: 'Draft',
  overdue: 'Overdue',
}

interface InvoiceListItemProps {
  invoice: DriverInvoiceRow
}

export function InvoiceListItem({ invoice }: InvoiceListItemProps) {
  const amountFormatted = invoice.amountVnd.toLocaleString('vi-VN')

  return (
    <details className="group open:ring-primary/20 rounded-md border border-[#cbccc9] bg-white open:ring-2">
      {/* Summary row — tap target */}
      <summary
        className={[
          'flex cursor-pointer list-none items-center gap-3 px-4 py-3',
          'focus-visible:ring-primary focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset',
          'select-none',
        ].join(' ')}
        aria-label={`${invoice.weekLabel}: ${amountFormatted}₫ — ${STATUS_LABELS[invoice.status]}`}
      >
        {/* Week label */}
        <span className="font-heading text-[18px] leading-none text-[#1a1a1a] uppercase">
          {invoice.weekLabel}
        </span>

        {/* Km */}
        <span className="text-[13px] text-[#666666]">
          {invoice.kmDriven.toLocaleString('vi-VN')} km
        </span>

        {/* Spacer */}
        <span className="flex-1" />

        {/* Amount */}
        <span className="font-mono text-[14px] font-semibold text-[#1a1a1a]">
          {amountFormatted}₫
        </span>

        {/* Status pill */}
        <span
          className={cn(
            'rounded px-2 py-0.5 text-[11px] font-bold tracking-[1px] uppercase',
            STATUS_STYLES[invoice.status],
          )}
        >
          {STATUS_LABELS[invoice.status]}
        </span>

        {/* Chevron */}
        <span
          className="ml-1 text-[#666666] transition-transform group-open:rotate-180"
          aria-hidden="true"
        >
          ▾
        </span>
      </summary>

      {/* Day-by-day breakdown */}
      <div className="border-t border-[#cbccc9] px-4 py-3">
        <p className="mb-2 text-[11px] font-bold tracking-[2.5px] text-[#666666] uppercase">
          Daily breakdown
        </p>
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-[#f0f0ee]">
              <th className="pb-1.5 text-left text-[11px] font-extrabold tracking-[1.5px] text-[#666666] uppercase">
                Date
              </th>
              <th className="pb-1.5 text-right text-[11px] font-extrabold tracking-[1.5px] text-[#666666] uppercase">
                KM
              </th>
            </tr>
          </thead>
          <tbody>
            {invoice.days.map((d) => (
              <tr key={d.date} className="border-b border-[#f7f8fa] last:border-0">
                <td className="py-1.5 text-[#1a1a1a]">{d.date}</td>
                <td className="py-1.5 text-right font-mono text-[#1a1a1a]">{d.km}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-right text-[11px] text-[#666666]">Issued&nbsp;{invoice.issuedAt}</p>
      </div>
    </details>
  )
}
