'use client'

import { useState, useTransition } from 'react'

import { toast } from 'sonner'

import { ReviewDrawer } from '@/components/admin/review-drawer'
import type { WithdrawalRequestRow } from '@/lib/admin/queries-withdrawal-requests'

import { reviewGarageWithdrawal } from './actions'

export function RejectGarageWithdrawalDrawer({
  row,
  onClose,
}: {
  row: WithdrawalRequestRow | null
  onClose: () => void
}) {
  const [pending, startTransition] = useTransition()
  const [reason, setReason] = useState('')

  function handleReject() {
    if (!row || !reason.trim()) {
      toast.error('Nhập lý do reject')
      return
    }
    startTransition(async () => {
      const result = await reviewGarageWithdrawal({
        withdrawalId: row.sourceId,
        decision: 'failed',
        reason,
      })
      if (result.error) toast.error(result.error)
      else {
        toast.success(`Đã reject và hoàn balance cho ${row.actorName}`)
        setReason('')
        onClose()
      }
    })
  }

  return (
    <ReviewDrawer open={row !== null} onOpenChange={(open) => !open && onClose()} title="Reject">
      {row && (
        <div className="space-y-4">
          <p className="rounded border border-[#cbccc9] bg-[#f7f8fa] p-3 text-[13px]">
            {row.actorName} · {row.amountVnd.toLocaleString('vi-VN')} ₫
          </p>
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={4}
            className="focus:ring-primary w-full rounded border border-[#cbccc9] px-3 py-2 text-[13px] focus:ring-2 focus:outline-none"
            placeholder="Reason"
          />
          <button
            type="button"
            onClick={handleReject}
            disabled={pending}
            className="w-full rounded bg-red-600 px-4 py-2.5 text-[13px] font-bold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {pending ? 'Rejecting...' : 'Reject & Refund Balance'}
          </button>
        </div>
      )}
    </ReviewDrawer>
  )
}
