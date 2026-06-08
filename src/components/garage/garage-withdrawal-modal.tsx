'use client'

/**
 * GarageWithdrawalModal — request payout modal.
 * Amount input + read-only bank info pulled from the garage profile so the
 * garage confirms the destination account before submitting.
 */
import { useState, useTransition } from 'react'

import { useRouter } from 'next/navigation'
import { Banknote, X } from 'lucide-react'
import { toast } from 'sonner'

import { requestGarageWithdrawal } from '@/app/garage/payout/actions'
import { formatVnd } from '@/lib/garage/format'
import type { GarageProfile } from '@/lib/garage/types'

interface Props {
  profile: GarageProfile
  minimumWithdrawalVnd: number
  onClose: () => void
}

export function GarageWithdrawalModal({ profile, minimumWithdrawalVnd, onClose }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [amount, setAmount] = useState(profile.balanceVnd.toLocaleString('vi-VN'))
  const amountVnd = moneyValue(amount)
  const hasBank = Boolean(profile.bankAccountName && profile.bankAccountNumber && profile.bankName)
  const blockedReason = !hasBank
    ? 'Hoàn tất payout settings trước khi rút.'
    : profile.balanceVnd < minimumWithdrawalVnd
      ? `Số tiền tối thiểu để rút là ${formatVnd(minimumWithdrawalVnd)}.`
      : amountVnd < minimumWithdrawalVnd
        ? `Số tiền rút tối thiểu là ${formatVnd(minimumWithdrawalVnd)}.`
        : amountVnd > profile.balanceVnd
          ? `Số tiền rút lớn hơn số dư hiện có là ${formatVnd(profile.balanceVnd)}.`
          : null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (blockedReason) {
      toast.error(blockedReason)
      return
    }
    startTransition(async () => {
      const result = await requestGarageWithdrawal({ amountVnd })
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success('Đã tạo yêu cầu rút tiền.')
      router.refresh()
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
        aria-labelledby="garage-withdrawal-title"
        className="w-full max-w-md rounded-xl bg-white shadow-2xl"
      >
        <div className="flex items-center gap-3 border-b border-[#cbccc9] px-5 py-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fff0e8]">
            <Banknote className="size-4 text-[#ff5c00]" aria-hidden="true" />
          </div>
          <h2 id="garage-withdrawal-title" className="flex-1 text-[15px] font-bold text-[#1a1a1a]">
            Yêu cầu rút tiền
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
          <label htmlFor="garage-withdrawal-amount" className="block space-y-1">
            <span className="text-[11px] font-bold tracking-[2.5px] text-[#666666] uppercase">
              Số tiền rút
            </span>
            <input
              id="garage-withdrawal-amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputMode="numeric"
              autoFocus
              className="focus:ring-primary h-12 w-full rounded border border-[#cbccc9] px-3 font-mono text-[14px] text-[#1a1a1a] focus:ring-2 focus:outline-none"
            />
          </label>

          <div className="space-y-2 rounded-md border border-[#cbccc9] bg-[#f7f8fa] p-3">
            <p className="text-[11px] font-bold tracking-[2px] text-[#666666] uppercase">
              Tài khoản nhận tiền
            </p>
            {hasBank ? (
              <dl className="space-y-1 text-[13px] text-[#1a1a1a]">
                <BankRow label="Chủ tài khoản" value={profile.bankAccountName} />
                <BankRow label="Số tài khoản" value={profile.bankAccountNumber} mono />
                <BankRow label="Ngân hàng" value={profile.bankName} />
              </dl>
            ) : (
              <p className="text-[12px] text-red-600">
                Chưa có thông tin ngân hàng. Cập nhật trong Profile trước khi rút.
              </p>
            )}
          </div>

          <p className="text-[12px] text-[#666666]">
            Yêu cầu rút tiền sẽ chờ admin duyệt và chuyển khoản thủ công.
          </p>

          {blockedReason && <p className="text-[12px] text-red-600">{blockedReason}</p>}
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
            disabled={pending || Boolean(blockedReason)}
            className="flex flex-1 items-center justify-center gap-2 rounded bg-[#1a1a1a] py-2 text-[13px] font-bold text-white hover:bg-[#333] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Banknote className="size-4" aria-hidden="true" />
            {pending ? 'Đang xử lý…' : 'Gửi yêu cầu'}
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

function moneyValue(value: string) {
  const parsed = parseInt(value.replace(/\D/g, ''), 10)
  return Number.isNaN(parsed) ? 0 : parsed
}
