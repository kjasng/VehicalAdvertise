/**
 * LedgerTable — pencil-styled table of partner ledger entries.
 * Sortable by timestamp. Server component (no interactivity needed).
 */
import { cn } from '@/lib/utils'
import type { PartnerLedgerRow } from '@/lib/partner/queries'

interface LedgerTableProps {
  rows: PartnerLedgerRow[]
  /** Max rows to display — undefined means show all */
  limit?: number
}

const COL_HEADERS = ['Time', 'Description', 'Amount (₫)', 'Dir', 'Balance (₫)'] as const

export function LedgerTable({ rows, limit }: LedgerTableProps) {
  const displayed = limit !== undefined ? rows.slice(0, limit) : rows

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13px]" aria-label="Partner ledger">
        <thead>
          <tr className="border-b border-[#cbccc9]">
            {COL_HEADERS.map((h) => (
              <th
                key={h}
                scope="col"
                className="pr-4 pb-2 text-left text-[11px] font-extrabold tracking-[2.5px] whitespace-nowrap text-[#666666] uppercase"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {displayed.map((row, i) => (
            <tr key={row.id} className={i % 2 === 1 ? 'bg-[#f7f8fa]' : ''}>
              <td className="py-2 pr-4 font-mono text-[12px] whitespace-nowrap text-[#666666]">
                {row.ts}
              </td>
              <td className="py-2 pr-4 text-[#1a1a1a]">{row.description}</td>
              <td className="py-2 pr-4 font-mono text-[12px] whitespace-nowrap text-[#1a1a1a]">
                {row.amountVnd.toLocaleString('vi-VN')}
              </td>
              <td className="py-2 pr-4">
                <span
                  className={cn(
                    'inline-block rounded px-1.5 py-0.5 text-[11px] font-bold uppercase',
                    row.direction === 'credit'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-600',
                  )}
                >
                  {row.direction}
                </span>
              </td>
              <td
                className={cn(
                  'py-2 font-mono text-[12px] font-bold whitespace-nowrap',
                  row.balance < 0 ? 'text-red-600' : 'text-[#1a1a1a]',
                )}
              >
                {row.balance < 0 ? '-' : ''}
                {Math.abs(row.balance).toLocaleString('vi-VN')}
              </td>
            </tr>
          ))}
          {displayed.length === 0 && (
            <tr>
              <td colSpan={5} className="py-8 text-center text-[13px] text-[#666666]">
                No ledger entries yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
