'use client'

import { CheckCircle, CircleX, Send } from 'lucide-react'

import type { WithdrawalRequestRow } from '@/lib/admin/queries-withdrawal-requests'

const STATUS_STYLES: Record<WithdrawalRequestRow['status'], string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  paid: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-600',
}

export function RequestsTable({
  rows,
  pending,
  onAction,
  onReject,
}: {
  rows: WithdrawalRequestRow[]
  pending: boolean
  onAction: (row: WithdrawalRequestRow, action: 'approve' | 'paid') => void
  onReject: (row: WithdrawalRequestRow) => void
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead className="bg-[#f7f8fa]">
          <tr>
            {['Role', 'Actor', 'Reference', 'Bank Account', 'Amount', 'Status', 'Actions'].map(
              (heading) => (
                <th
                  key={heading}
                  className="border-b border-[#cbccc9] px-4 py-3 text-left text-[12px] font-extrabold tracking-[1.5px] text-[#1a1a1a] uppercase"
                >
                  {heading}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-[#cbccc9] last:border-0">
              <td className="px-4 py-3 font-bold uppercase">{row.role}</td>
              <td className="px-4 py-3">
                <p className="font-medium text-[#1a1a1a]">{row.actorName}</p>
                <p className="text-[11px] text-[#999]">{row.email ?? row.phone ?? '—'}</p>
              </td>
              <td className="px-4 py-3">
                <p className="font-mono text-[12px] text-[#666666]">{row.reference}</p>
                <p className="text-[11px] text-[#999]">{row.periodLabel}</p>
              </td>
              <td className="px-4 py-3 text-[#666666]">
                <p>{row.bankAccountNumber ?? '—'}</p>
                <p className="text-[11px]">
                  {[row.bankAccountName, row.bankName].filter(Boolean).join(' · ') || '—'}
                </p>
              </td>
              <td className="px-4 py-3 font-mono font-bold">
                {row.amountVnd.toLocaleString('vi-VN')} ₫
              </td>
              <td className="px-4 py-3">
                <span
                  className={`rounded px-2 py-0.5 text-[11px] font-bold uppercase ${STATUS_STYLES[row.status]}`}
                >
                  {row.status}
                </span>
              </td>
              <td className="px-4 py-3">
                <ActionButtons
                  row={row}
                  disabled={pending}
                  onAction={onAction}
                  onReject={onReject}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ActionButtons({
  row,
  disabled,
  onAction,
  onReject,
}: {
  row: WithdrawalRequestRow
  disabled: boolean
  onAction: (row: WithdrawalRequestRow, action: 'approve' | 'paid') => void
  onReject: (row: WithdrawalRequestRow) => void
}) {
  return (
    <div className="flex gap-1">
      {row.status === 'pending' && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => onAction(row, 'approve')}
          className="flex items-center gap-1 rounded border border-[#cbccc9] px-2 py-1 text-[11px] font-medium hover:bg-[#f7f8fa] disabled:opacity-50"
        >
          <Send className="size-3" aria-hidden="true" />
          Approve
        </button>
      )}
      {row.status === 'processing' && (row.role === 'garage' || row.payoutId) && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => onAction(row, 'paid')}
          className="flex items-center gap-1 rounded border border-[#cbccc9] px-2 py-1 text-[11px] font-medium hover:bg-[#f7f8fa] disabled:opacity-50"
        >
          <CheckCircle className="size-3" aria-hidden="true" />
          Mark paid
        </button>
      )}
      {row.role === 'garage' && ['pending', 'processing'].includes(row.status) && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => onReject(row)}
          className="flex items-center gap-1 rounded border border-red-200 px-2 py-1 text-[11px] font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          <CircleX className="size-3" aria-hidden="true" />
          Reject
        </button>
      )}
    </div>
  )
}
