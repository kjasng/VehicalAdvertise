/**
 * PayoutRow — single withdrawal request row: number, request date, amount,
 * status pill, and a print link. Used for non-paid (recent) requests.
 */
import Link from 'next/link'
import { Printer } from 'lucide-react'

import { formatVnd } from '@/lib/garage/format'
import type { GarageWithdrawalRow } from '@/lib/garage/types'
import { cn } from '@/lib/utils'

const STATUS_STYLES: Record<GarageWithdrawalRow['status'], { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-amber-100 text-amber-700' },
  processing: { label: 'Processing', className: 'bg-blue-100 text-blue-700' },
  paid: { label: 'Paid', className: 'bg-green-100 text-green-700' },
  failed: { label: 'Failed', className: 'bg-red-100 text-red-600' },
}

interface PayoutRowProps {
  entry: GarageWithdrawalRow
}

export function PayoutRow({ entry }: PayoutRowProps) {
  const { label: statusLabel, className: pillClass } = STATUS_STYLES[entry.status]

  return (
    <article className="flex flex-col gap-2 rounded-md border border-[#cbccc9] bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Left: week + install count */}
      <div className="flex flex-col gap-0.5">
        <p className="text-[14px] font-semibold text-[#1a1a1a]">{entry.withdrawalNumber}</p>
        <p className="text-[12px] text-[#666666]">{entry.requestedAt.slice(0, 10)}</p>
      </div>

      {/* Right: amount + status + tx ID */}
      <div className="flex flex-wrap items-center gap-3 sm:justify-end">
        <p className="font-heading text-[22px] leading-none text-[#1a1a1a]">
          {formatVnd(entry.amountVnd)}
        </p>

        <span
          className={cn(
            'rounded px-2 py-0.5 text-[11px] font-bold tracking-[1px] uppercase',
            pillClass,
          )}
          aria-label={`Trạng thái: ${statusLabel}`}
        >
          {statusLabel}
        </span>

        {entry.failureReason ? (
          <span className="text-[11px] text-red-600" aria-label="Failure reason">
            {entry.failureReason}
          </span>
        ) : (
          <span className="text-[11px] text-[#999]" aria-label="Chưa có mã giao dịch">
            —
          </span>
        )}

        <Link
          href={`/garage/payout/${entry.id}/print`}
          className="inline-flex h-8 items-center gap-1 rounded border border-[#cbccc9] px-2 text-[11px] font-bold tracking-[1px] text-[#1a1a1a] uppercase hover:bg-[#f7f8fa]"
        >
          <Printer className="size-3.5" aria-hidden="true" />
          Invoice
        </Link>
      </div>
    </article>
  )
}
