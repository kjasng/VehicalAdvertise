'use client'

import { useState, useTransition } from 'react'

import { CheckCircle, CircleX, Send, type LucideIcon } from 'lucide-react'
import { toast } from 'sonner'

import { ReviewDrawer } from '@/components/admin/review-drawer'
import type { GarageWithdrawalAdminRow } from '@/lib/admin/queries-payouts'

import { reviewGarageWithdrawal } from './actions'

const STATUS_STYLES: Record<GarageWithdrawalAdminRow['status'], string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  paid: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-600',
}

export function ActionButton({
  label,
  icon: Icon,
  onClick,
  disabled,
  danger = false,
}: {
  label: string
  icon: LucideIcon
  onClick: () => void
  disabled: boolean
  danger?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-1 rounded border px-2 py-1 text-[11px] font-medium disabled:opacity-50 ${
        danger
          ? 'border-red-200 text-red-600 hover:bg-red-50'
          : 'border-[#cbccc9] text-[#1a1a1a] hover:bg-[#f7f8fa]'
      }`}
    >
      <Icon className="size-3" aria-hidden="true" />
      {label}
    </button>
  )
}

export function GarageWithdrawalRow({
  row,
  disabled,
  onApprove,
  onPaid,
  onReject,
}: {
  row: GarageWithdrawalAdminRow
  disabled: boolean
  onApprove: () => void
  onPaid: () => void
  onReject: () => void
}) {
  return (
    <tr className="border-b border-[#cbccc9] last:border-0">
      <td className="px-4 py-3">
        <p className="font-medium text-[#1a1a1a]">{row.garageName}</p>
        <p className="font-mono text-[11px] text-[#999]">{row.withdrawalNumber}</p>
      </td>
      <td className="px-4 py-3 text-[#666666]">
        <p>{row.bankAccountNumber ?? '—'}</p>
        <p className="text-[11px]">
          {[row.bankAccountName, row.bankName].filter(Boolean).join(' · ') || '—'}
        </p>
      </td>
      <td className="px-4 py-3 font-mono font-bold">{row.amountVnd.toLocaleString('vi-VN')} ₫</td>
      <td className="px-4 py-3 font-mono text-[12px] text-[#666666]">
        {row.requestedAt.slice(0, 10)}
      </td>
      <td className="px-4 py-3">
        <span
          className={`rounded px-2 py-0.5 text-[11px] font-bold uppercase ${STATUS_STYLES[row.status]}`}
        >
          {row.status}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-1">
          {row.status === 'pending' && (
            <ActionButton label="Approve" icon={Send} onClick={onApprove} disabled={disabled} />
          )}
          {row.status === 'processing' && (
            <ActionButton
              label="Mark paid"
              icon={CheckCircle}
              onClick={onPaid}
              disabled={disabled}
            />
          )}
          {['pending', 'processing'].includes(row.status) && (
            <ActionButton
              label="Reject"
              icon={CircleX}
              onClick={onReject}
              disabled={disabled}
              danger
            />
          )}
        </div>
      </td>
    </tr>
  )
}

export function RejectWithdrawalDrawer({
  row,
  onClose,
}: {
  row: GarageWithdrawalAdminRow | null
  onClose: () => void
}) {
  const [pending, startTransition] = useTransition()
  const [reason, setReason] = useState('')

  function handleReject() {
    if (!row) return
    if (!reason.trim()) {
      toast.error('Nhập lý do reject')
      return
    }
    startTransition(async () => {
      const result = await reviewGarageWithdrawal({
        withdrawalId: row.id,
        decision: 'failed',
        reason,
      })
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success(`Đã reject và hoàn balance cho ${row.garageName}`)
      setReason('')
      onClose()
    })
  }

  return (
    <ReviewDrawer
      open={row !== null}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
      title="Reject Garage Withdrawal"
    >
      {row && (
        <div className="space-y-4">
          <div className="rounded border border-[#cbccc9] bg-[#f7f8fa] p-3 text-[13px]">
            <p className="font-bold text-[#1a1a1a]">{row.garageName}</p>
            <p className="font-mono text-[12px] text-[#666666]">
              {row.amountVnd.toLocaleString('vi-VN')} ₫
            </p>
          </div>
          <label htmlFor="garage-withdrawal-reject-reason" className="block space-y-1">
            <span className="text-[11px] font-bold tracking-[2px] text-[#666666] uppercase">
              Reason
            </span>
            <textarea
              id="garage-withdrawal-reject-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={4}
              className="focus:ring-primary w-full rounded border border-[#cbccc9] px-3 py-2 text-[13px] focus:ring-2 focus:outline-none"
            />
          </label>
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
