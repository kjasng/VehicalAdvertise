'use client'

import { useMemo, useState, useTransition } from 'react'

import { X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import type { LedgerTarget } from '@/lib/admin/queries-ledger-adjustments'

import { createLedgerAdjustment } from './actions'

interface Props {
  targets: LedgerTarget[]
  onClose: () => void
}

export function LedgerAdjustmentModal({ targets, onClose }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [targetType, setTargetType] = useState<'partner' | 'driver'>('partner')
  const [targetId, setTargetId] = useState('')
  const [kind, setKind] = useState<'adjustment' | 'refund'>('refund')
  const [direction, setDirection] = useState<'credit' | 'debit'>('credit')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')

  const filteredTargets = useMemo(
    () => targets.filter((target) => target.type === targetType),
    [targets, targetType],
  )

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const amountVnd = parseInt(amount.replace(/\D/g, ''), 10)
    if (!targetId) {
      toast.error('Chọn đối tượng')
      return
    }
    if (!amountVnd || amountVnd <= 0) {
      toast.error('Nhập số tiền hợp lệ')
      return
    }

    startTransition(async () => {
      const result = await createLedgerAdjustment({
        targetType,
        targetId,
        kind,
        direction,
        amountVnd,
        note,
      })
      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success('Đã ghi nhận điều chỉnh')
      onClose()
      router.refresh()
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-[#cbccc9] px-5 py-4">
          <h2 className="text-[15px] font-bold text-[#1a1a1a]">Tạo điều chỉnh sổ cái</h2>
          <button onClick={onClose} className="rounded p-1 text-[#999] hover:bg-[#f0f0ee]">
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-[11px] font-bold tracking-[2px] text-[#666666] uppercase">
                Loại
              </label>
              <select
                value={targetType}
                onChange={(e) => {
                  setTargetType(e.target.value as 'partner' | 'driver')
                  setTargetId('')
                }}
                className="focus:ring-primary h-[40px] w-full rounded border border-[#cbccc9] bg-white px-3 text-[13px] focus:ring-2 focus:outline-none"
              >
                <option value="partner">Partner</option>
                <option value="driver">Driver</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-bold tracking-[2px] text-[#666666] uppercase">
                Đối tượng *
              </label>
              <select
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                className="focus:ring-primary h-[40px] w-full rounded border border-[#cbccc9] bg-white px-3 text-[13px] focus:ring-2 focus:outline-none"
              >
                <option value="">-- Chọn --</option>
                {filteredTargets.length === 0 && <option disabled>Không có đối tượng</option>}
                {filteredTargets.map((target) => (
                  <option key={target.id} value={target.id}>
                    {target.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-[11px] font-bold tracking-[2px] text-[#666666] uppercase">
                Loại bút toán
              </label>
              <select
                value={kind}
                onChange={(e) => setKind(e.target.value as 'adjustment' | 'refund')}
                className="focus:ring-primary h-[40px] w-full rounded border border-[#cbccc9] bg-white px-3 text-[13px] focus:ring-2 focus:outline-none"
              >
                <option value="refund">Hoàn tiền (refund)</option>
                <option value="adjustment">Điều chỉnh (adjustment)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-bold tracking-[2px] text-[#666666] uppercase">
                Chiều
              </label>
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value as 'credit' | 'debit')}
                className="focus:ring-primary h-[40px] w-full rounded border border-[#cbccc9] bg-white px-3 text-[13px] focus:ring-2 focus:outline-none"
              >
                <option value="credit">Cộng (+)</option>
                <option value="debit">Trừ (-)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-bold tracking-[2px] text-[#666666] uppercase">
              Số tiền (VND) *
            </label>
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="500,000"
              autoFocus
              required
              className="focus:ring-primary h-[40px] w-full rounded border border-[#cbccc9] px-3 font-mono text-[13px] text-[#1a1a1a] focus:ring-2 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-bold tracking-[2px] text-[#666666] uppercase">
              Lý do *
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              required
              placeholder="VD: Hoàn tiền do giao dịch SePay trùng lặp ngày 02/06"
              className="focus:ring-primary w-full rounded border border-[#cbccc9] px-3 py-2 text-[13px] text-[#1a1a1a] placeholder:text-[#bbb] focus:ring-2 focus:outline-none"
            />
          </div>

          <div className="flex gap-3 border-t border-[#cbccc9] pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded border border-[#cbccc9] py-2 text-[13px] font-medium text-[#666666] hover:bg-[#f7f8fa]"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={pending || filteredTargets.length === 0}
              className="flex-1 rounded bg-[#1a1a1a] py-2 text-[13px] font-bold text-white hover:bg-[#333] disabled:opacity-50"
            >
              {pending ? 'Đang xử lý...' : 'Ghi nhận'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
