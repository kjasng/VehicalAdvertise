'use client'

import { useTransition } from 'react'

import { Banknote, X } from 'lucide-react'
import { toast } from 'sonner'

import { createDriverWithdrawalInvoice } from '@/app/driver/invoice/actions'
import { formatVnd } from '@/lib/driver/monthly-earning'
import type { DriverBankInfo } from '@/lib/driver/queries-invoices'

interface Props {
  amountVnd: number
  periodStart: string
  periodEnd: string
  bankInfo: DriverBankInfo
  onClose: () => void
}

export function DriverWithdrawalModal({
  amountVnd,
  periodStart,
  periodEnd,
  bankInfo,
  onClose,
}: Props) {
  const [pending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const result = await createDriverWithdrawalInvoice()
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success('Đã tạo hóa đơn rút tiền thành công.')
      onClose()
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="driver-withdrawal-title"
        className="w-full max-w-md rounded-xl bg-white shadow-2xl"
      >
        <div className="flex items-center gap-3 border-b border-[#cbccc9] px-5 py-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fff0e8]">
            <Banknote className="size-4 text-[#ff5c00]" aria-hidden="true" />
          </div>
          <h2 id="driver-withdrawal-title" className="flex-1 text-[15px] font-bold text-[#1a1a1a]">
            Xác nhận rút tiền
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded p-1 text-[#999] hover:bg-[#f0f0ee] hover:text-[#1a1a1a]"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-4">
          <div className="rounded-md border border-[#cbccc9] bg-[#f7f8fa] p-3">
            <p className="text-[11px] font-bold tracking-[2px] text-[#666666] uppercase">
              Kỳ thanh toán
            </p>
            <p className="mt-1 font-mono text-[13px] text-[#1a1a1a]">
              {periodStart} → {periodEnd}
            </p>
          </div>

          <div className="rounded-md border border-[#cbccc9] bg-[#f7f8fa] p-3">
            <p className="text-[11px] font-bold tracking-[2px] text-[#666666] uppercase">
              Số tiền nhận
            </p>
            <p className="font-heading mt-1 text-[28px] leading-none text-[#1a1a1a] uppercase">
              {formatVnd(amountVnd)}
            </p>
          </div>

          <div className="space-y-2 rounded-md border border-[#cbccc9] bg-[#f7f8fa] p-3">
            <p className="text-[11px] font-bold tracking-[2px] text-[#666666] uppercase">
              Tài khoản nhận tiền
            </p>
            <dl className="space-y-1 text-[13px] text-[#1a1a1a]">
              <BankRow label="Chủ tài khoản" value={bankInfo.bankAccountName} />
              <BankRow label="Số tài khoản" value={bankInfo.bankAccountNumber} mono />
              <BankRow label="Ngân hàng" value={bankInfo.bankName} />
            </dl>
          </div>

          <p className="text-[12px] text-[#666666]">
            Hóa đơn sẽ được tạo và chờ admin xét duyệt. Tiền sẽ được chuyển khoản sau khi duyệt.
          </p>
        </div>

        <div className="flex gap-3 border-t border-[#cbccc9] px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded border border-[#cbccc9] py-2 text-[13px] font-medium text-[#666666] hover:bg-[#f7f8fa]"
          >
            Huỷ
          </button>
          <button
            type="submit"
            disabled={pending}
            className="flex flex-1 items-center justify-center gap-2 rounded bg-[#1a1a1a] py-2 text-[13px] font-bold text-white hover:bg-[#333] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Banknote className="size-4" aria-hidden="true" />
            {pending ? 'Đang xử lý…' : 'Xác nhận rút tiền'}
          </button>
        </div>
      </form>
    </div>
  )
}

function BankRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-[#666666]">{label}</dt>
      <dd className={mono ? 'font-mono font-semibold' : 'font-semibold'}>{value}</dd>
    </div>
  )
}
