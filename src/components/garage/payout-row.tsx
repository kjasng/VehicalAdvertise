/**
 * PayoutRow — server component.
 * Single weekly payout row: week label, total VND, status pill, transaction ID.
 */
import { cn } from '@/lib/utils'

import type { PayoutEntry, PayoutStatus } from './mock-data'

const STATUS_STYLES: Record<PayoutStatus, { label: string; className: string }> = {
  pending: { label: 'Chờ thanh toán', className: 'bg-amber-100 text-amber-700' },
  paid: { label: 'Đã thanh toán', className: 'bg-green-100 text-green-700' },
}

function formatVnd(amount: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

interface PayoutRowProps {
  entry: PayoutEntry
}

export function PayoutRow({ entry }: PayoutRowProps) {
  const { label: statusLabel, className: pillClass } = STATUS_STYLES[entry.status]

  return (
    <article className="flex flex-col gap-2 rounded-md border border-[#cbccc9] bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Left: week + install count */}
      <div className="flex flex-col gap-0.5">
        <p className="text-[14px] font-semibold text-[#1a1a1a]">{entry.weekLabel}</p>
        <p className="text-[12px] text-[#666666]">{entry.installCount} lượt lắp đặt</p>
      </div>

      {/* Right: amount + status + tx ID */}
      <div className="flex flex-wrap items-center gap-3 sm:justify-end">
        <p className="font-heading text-[22px] leading-none text-[#1a1a1a]">
          {formatVnd(entry.totalVnd)}
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

        {entry.transactionId ? (
          <span
            className="font-mono text-[11px] text-[#666666]"
            aria-label={`Mã giao dịch: ${entry.transactionId}`}
          >
            {entry.transactionId}
          </span>
        ) : (
          <span className="text-[11px] text-[#999]" aria-label="Chưa có mã giao dịch">
            —
          </span>
        )}
      </div>
    </article>
  )
}
