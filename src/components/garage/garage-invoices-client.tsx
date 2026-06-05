'use client'

/**
 * GarageInvoicesClient — garage invoices view.
 * Top: paid payouts as an invoices table with a period filter (month/quarter/year).
 * Below: recent non-paid withdrawal requests. A button opens the payout request modal.
 */
import { useMemo, useState } from 'react'

import { Banknote } from 'lucide-react'

import { PayoutRow } from '@/components/garage/payout-row'
import { GarageInvoiceTable } from '@/components/garage/garage-invoice-table'
import { GarageWithdrawalModal } from '@/components/garage/garage-withdrawal-modal'
import type { GaragePayoutData, GarageWithdrawalRow } from '@/lib/garage/types'

type Period = 'all' | 'month' | 'quarter' | 'year'

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'month', label: 'Tháng này' },
  { value: 'quarter', label: 'Quý này' },
  { value: 'year', label: 'Năm nay' },
]

export function GarageInvoicesClient({
  profile,
  minimumWithdrawalVnd,
  withdrawals,
}: GaragePayoutData) {
  const [period, setPeriod] = useState<Period>('all')
  const [modalOpen, setModalOpen] = useState(false)

  const paidInvoices = useMemo(
    () => withdrawals.filter((row) => row.status === 'paid'),
    [withdrawals],
  )
  const recentRequests = useMemo(
    () => withdrawals.filter((row) => row.status !== 'paid'),
    [withdrawals],
  )
  const filteredInvoices = useMemo(
    () => paidInvoices.filter((row) => inPeriod(row, period)),
    [paidInvoices, period],
  )

  return (
    <>
      <section className="rounded-md border border-[#cbccc9] bg-white">
        <header className="flex flex-col gap-3 border-b border-[#cbccc9] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <h2 className="font-heading text-[20px] leading-none text-[#1a1a1a] uppercase">
              Invoices List
            </h2>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="flex h-9 items-center gap-2 rounded bg-[#ff5c00] px-3 text-[12px] font-bold tracking-[0.5px] text-white hover:bg-[#e65300]"
            >
              <Banknote className="size-4" aria-hidden="true" />
              Request payout
            </button>
          </div>
          <label className="flex items-center gap-2 sm:ml-auto">
            <span className="text-[11px] font-bold tracking-[1px] text-[#666666] uppercase">
              Kỳ
            </span>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as Period)}
              className="focus:ring-primary h-9 rounded border border-[#cbccc9] bg-white px-2 text-[13px] text-[#1a1a1a] focus:ring-2 focus:outline-none"
            >
              {PERIOD_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
        </header>
        <GarageInvoiceTable invoices={filteredInvoices} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-[20px] leading-none text-[#1a1a1a] uppercase">
          Recent requests
        </h2>
        {recentRequests.length === 0 ? (
          <p className="text-[14px] text-[#666666]">Không có yêu cầu đang chờ xử lý.</p>
        ) : (
          recentRequests.map((entry) => <PayoutRow key={entry.id} entry={entry} />)
        )}
      </section>

      {modalOpen && (
        <GarageWithdrawalModal
          profile={profile}
          minimumWithdrawalVnd={minimumWithdrawalVnd}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  )
}

function inPeriod(row: GarageWithdrawalRow, period: Period): boolean {
  if (period === 'all') return true
  const stamp = row.paidAt ?? row.requestedAt
  const date = new Date(stamp)
  if (Number.isNaN(date.getTime())) return false
  const now = new Date()
  if (date.getFullYear() !== now.getFullYear()) return false
  if (period === 'year') return true
  if (period === 'month') return date.getMonth() === now.getMonth()
  // quarter
  return Math.floor(date.getMonth() / 3) === Math.floor(now.getMonth() / 3)
}
