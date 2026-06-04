/**
 * PayoutRow — server component.
 * Single weekly payout row: week label, total VND, status pill, transaction ID.
 */
import { cn } from '@/lib/utils'
import type { GarageWithdrawalRow } from '@/lib/garage/types'

const STATUS_STYLES: Record<GarageWithdrawalRow['status'], { label: string; className: string }> = {
  pending: { label: 'Chờ admin duyệt', className: 'bg-amber-100 text-amber-700' },
  processing: { label: 'Admin đã duyệt', className: 'bg-blue-100 text-blue-700' },
  paid: { label: 'Đã thanh toán', className: 'bg-green-100 text-green-700' },
  failed: { label: 'Đã từ chối', className: 'bg-red-100 text-red-600' },
}

function formatVnd(amount: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
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
      </div>
    </article>
  )
}
