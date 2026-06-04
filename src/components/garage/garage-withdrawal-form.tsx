'use client'

import { useState, useTransition } from 'react'

import { Banknote } from 'lucide-react'
import { toast } from 'sonner'

import { requestGarageWithdrawal } from '@/app/garage/payout/actions'
import { formatVnd } from '@/lib/garage/format'
import type { GarageProfile } from '@/lib/garage/types'

export function GarageWithdrawalForm({
  profile,
  minimumWithdrawalVnd,
}: {
  profile: GarageProfile
  minimumWithdrawalVnd: number
}) {
  const [pending, startTransition] = useTransition()
  const [amount, setAmount] = useState(profile.balanceVnd.toLocaleString('vi-VN'))
  const amountVnd = moneyValue(amount)
  const hasBank = Boolean(profile.bankAccountName && profile.bankAccountNumber && profile.bankName)
  const blockedReason = !profile.approved
    ? 'Garage chưa được admin approve.'
    : !hasBank
      ? 'Hoàn tất payout settings trước khi rút.'
      : profile.balanceVnd < minimumWithdrawalVnd
        ? `Balance cần đạt tối thiểu ${formatVnd(minimumWithdrawalVnd)}.`
        : amountVnd < minimumWithdrawalVnd
          ? `Số tiền rút tối thiểu ${formatVnd(minimumWithdrawalVnd)}.`
          : amountVnd > profile.balanceVnd
            ? 'Số tiền rút lớn hơn balance hiện tại.'
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
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-md border border-[#cbccc9] bg-white p-4"
    >
      <div>
        <p className="text-[11px] font-bold tracking-[2.5px] text-[#ff5c00] uppercase">
          Withdrawal
        </p>
        <h2 className="font-heading text-[24px] leading-none text-[#1a1a1a] uppercase">
          Rút tiền garage
        </h2>
      </div>

      <label htmlFor="garage-withdrawal-amount" className="block space-y-1">
        <span className="text-[11px] font-bold tracking-[2.5px] text-[#666666] uppercase">
          Amount
        </span>
        <input
          id="garage-withdrawal-amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          inputMode="numeric"
          className="focus:ring-primary h-12 w-full rounded border border-[#cbccc9] px-3 font-mono text-[14px] text-[#1a1a1a] focus:ring-2 focus:outline-none"
        />
      </label>

      <div className="text-[12px] text-[#666666]">
        Balance: <span className="font-bold text-[#1a1a1a]">{formatVnd(profile.balanceVnd)}</span>
        {' · '}Minimum: <span className="font-bold">{formatVnd(minimumWithdrawalVnd)}</span>
      </div>
      <p className="text-[12px] text-[#666666]">
        Yêu cầu rút tiền sẽ chờ admin duyệt và chuyển khoản thủ công.
      </p>

      {blockedReason && <p className="text-[12px] text-red-600">{blockedReason}</p>}

      <button
        type="submit"
        disabled={pending || Boolean(blockedReason)}
        className="flex h-11 items-center justify-center gap-2 rounded bg-[#1a1a1a] px-5 text-[13px] font-bold text-white hover:bg-[#333] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Banknote className="size-4" aria-hidden="true" />
        {pending ? 'Processing...' : 'Request withdrawal'}
      </button>
    </form>
  )
}

function moneyValue(value: string) {
  const parsed = parseInt(value.replace(/\D/g, ''), 10)
  return Number.isNaN(parsed) ? 0 : parsed
}
