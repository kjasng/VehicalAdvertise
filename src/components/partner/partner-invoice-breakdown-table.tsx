import Link from 'next/link'
import { FileText } from 'lucide-react'

import { formatVnd } from '@/lib/partner/constants'
import type {
  PartnerCampaignInvoiceLine,
  PartnerCampaignInvoiceRow,
} from '@/lib/partner/invoice-breakdown-types'

const MAIN_HEADINGS = [
  'Campaign',
  'Plan',
  'Budget',
  'Driver',
  'Garage',
  'Platform',
  'Remaining',
  'Invoice',
]

const DETAIL_HEADINGS = [
  'Type',
  'Recipient',
  'Vehicle',
  'Period / date',
  'Driver',
  'Platform',
  'Garage',
  'Total',
]

export function PartnerInvoiceBreakdownTable({ rows }: { rows: PartnerCampaignInvoiceRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead className="bg-[#f7f8fa]">
          <tr>
            {MAIN_HEADINGS.map((heading) => (
              <th
                key={heading}
                className="border-b border-[#cbccc9] px-4 py-3 text-left text-[11px] font-extrabold tracking-[1.5px] whitespace-nowrap text-[#1a1a1a] uppercase"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <RowGroup key={row.id} row={row} striped={index % 2 === 1} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function RowGroup({ row, striped }: { row: PartnerCampaignInvoiceRow; striped: boolean }) {
  return (
    <>
      <tr className={`border-b border-[#cbccc9] ${striped ? 'bg-[#f7f8fa]' : ''}`}>
        <td className="px-4 py-3">
          <p className="font-bold text-[#1a1a1a]">{row.name}</p>
          <p className="text-[11px] text-[#666666]">
            {row.status.replace(/_/g, ' ')} · {row.driverCount} drivers
          </p>
        </td>
        <td className="px-4 py-3 text-[#666666]">{row.packageLabel}</td>
        <MoneyCell value={row.budgetVnd} />
        <MoneyCell
          value={row.driverPaidVnd}
          muted={row.driverPaidVnd === 0}
          hint={`est. ${formatVnd(row.estimatedDriverVnd)}`}
        />
        <MoneyCell
          value={row.garagePaidVnd}
          muted={row.garagePaidVnd === 0}
          hint={`est. ${formatVnd(row.estimatedGarageVnd)}`}
        />
        <MoneyCell
          value={row.platformFeeVnd}
          muted={row.platformFeeVnd === 0}
          hint={`est. ${formatVnd(row.estimatedPlatformFeeVnd)}`}
        />
        <MoneyCell value={row.remainingVnd} danger={row.remainingVnd < 0} />
        <td className="px-4 py-3">
          <Link
            href={`/partner/invoices/${row.id}/print`}
            className="inline-flex h-9 items-center gap-2 rounded border border-[#cbccc9] px-3 text-[11px] font-bold tracking-[1px] whitespace-nowrap text-[#1a1a1a] uppercase hover:bg-white"
          >
            <FileText className="size-4" aria-hidden="true" />
            Print/PDF
          </Link>
        </td>
      </tr>
      <tr className={`border-b border-[#cbccc9] last:border-0 ${striped ? 'bg-[#f7f8fa]' : ''}`}>
        <td colSpan={8} className="px-4 pb-4">
          <PaymentDetail lines={row.lines} />
        </td>
      </tr>
    </>
  )
}

function PaymentDetail({ lines }: { lines: PartnerCampaignInvoiceLine[] }) {
  if (lines.length === 0) {
    return (
      <p className="text-[12px] text-[#666666]">
        No paid driver periods or garage install payouts recorded yet. Estimated amounts are shown
        above.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto border border-[#e2e2df] bg-white">
      <table className="w-full text-[12px]">
        <thead>
          <tr>
            {DETAIL_HEADINGS.map((heading) => (
              <th
                key={heading}
                className="border-b border-[#e2e2df] px-3 py-2 text-left text-[10px] font-extrabold tracking-[1.2px] whitespace-nowrap text-[#666666] uppercase"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {lines.map((line) => (
            <tr key={line.id} className="border-b border-[#f0f0ee] last:border-0">
              <td className="px-3 py-2 font-bold whitespace-nowrap text-[#1a1a1a]">{line.label}</td>
              <td className="px-3 py-2 text-[#1a1a1a]">{line.recipientName}</td>
              <td className="px-3 py-2 font-mono text-[#666666]">{line.vehiclePlate}</td>
              <td className="px-3 py-2 whitespace-nowrap text-[#666666]">{line.periodLabel}</td>
              <LineMoney value={line.driverNetVnd} />
              <LineMoney value={line.platformFeeVnd} />
              <LineMoney value={line.garageVnd} />
              <LineMoney value={line.amountVnd} strong />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function MoneyCell({
  value,
  muted = false,
  danger = false,
  hint,
}: {
  value: number
  muted?: boolean
  danger?: boolean
  hint?: string
}) {
  return (
    <td
      className={`px-4 py-3 font-mono text-[12px] whitespace-nowrap ${
        danger ? 'font-bold text-red-600' : muted ? 'text-[#999]' : 'text-[#1a1a1a]'
      }`}
    >
      <span>{formatVnd(value)}</span>
      {hint && <span className="mt-1 block font-sans text-[11px] text-[#666666]">{hint}</span>}
    </td>
  )
}

function LineMoney({ value, strong = false }: { value: number; strong?: boolean }) {
  return (
    <td
      className={`px-3 py-2 font-mono whitespace-nowrap ${
        value === 0 ? 'text-[#aaa]' : strong ? 'font-bold text-[#1a1a1a]' : 'text-[#666666]'
      }`}
    >
      {value === 0 ? '—' : formatVnd(value)}
    </td>
  )
}
