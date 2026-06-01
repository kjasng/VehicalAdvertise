'use client'

import { useState, useTransition } from 'react'

import { BadgeDollarSign, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

import { ReviewDrawer } from '@/components/admin/review-drawer'
import { EmptyState } from '@/components/shared/empty-state'
import { SectionShell } from '@/components/shared/section-shell'
import type { DriverBalance, PayoutRow } from '@/lib/admin/queries-payouts'

import { createPayout, markPayoutPaid } from './actions'

// ─── status pill styles ────────────────────────────────────────────────────

const STATUS_STYLES: Record<PayoutRow['status'], string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  paid: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-600',
}

// ─── Driver Balances ───────────────────────────────────────────────────────

interface DriverBalancesProps {
  balances: DriverBalance[]
}

export function DriverBalancesTable({ balances }: DriverBalancesProps) {
  const [selected, setSelected] = useState<DriverBalance | null>(null)

  if (balances.length === 0)
    return (
      <SectionShell title="Pending Balances">
        <EmptyState
          kicker="empty"
          title="All Paid"
          helper="No drivers have an outstanding balance."
        />
      </SectionShell>
    )

  return (
    <>
      <SectionShell title={`Pending Balances (${balances.length})`}>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="bg-[#f7f8fa]">
              <tr>
                {['Driver', 'Bank Account', 'Total Accrued', 'Total Paid', 'Net Balance', ''].map(
                  (h) => (
                    <th
                      key={h}
                      className="border-b border-[#cbccc9] px-4 py-3 text-left text-[12px] font-extrabold tracking-[1.5px] text-[#1a1a1a] uppercase"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {balances.map((b, i) => (
                <tr
                  key={b.driverId}
                  className={`border-b border-[#cbccc9] last:border-0 ${i % 2 === 1 ? 'bg-[#f7f8fa]' : ''}`}
                >
                  <td className="px-4 py-3 font-medium text-[#1a1a1a]">{b.driverName}</td>
                  <td className="px-4 py-3 font-mono text-[12px] text-[#666666]">
                    {b.bankAccountNumber ?? '—'}
                    {b.bankAccountName && (
                      <span className="ml-1 text-[#999]">({b.bankAccountName})</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-[12px] text-[#1a1a1a]">
                    {b.totalAccrualVnd.toLocaleString('vi-VN')}
                  </td>
                  <td className="px-4 py-3 font-mono text-[12px] text-[#666666]">
                    {b.totalPaidVnd.toLocaleString('vi-VN')}
                  </td>
                  <td className="px-4 py-3 font-mono text-[13px] font-bold text-green-700">
                    {b.netBalanceVnd.toLocaleString('vi-VN')} ₫
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelected(b)}
                      className="flex items-center gap-1.5 rounded border border-[#cbccc9] px-3 py-1.5 text-[12px] font-medium text-[#1a1a1a] transition-colors hover:bg-[#f7f8fa]"
                    >
                      <BadgeDollarSign className="size-3.5" aria-hidden="true" />
                      Pay Out
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionShell>

      <ReviewDrawer
        open={selected !== null}
        onOpenChange={(o) => {
          if (!o) setSelected(null)
        }}
        title="Create Payout"
      >
        {selected && <CreatePayoutForm balance={selected} onClose={() => setSelected(null)} />}
      </ReviewDrawer>
    </>
  )
}

// ─── Create Payout Form (inside drawer) ───────────────────────────────────

function todayStr() {
  return new Date().toISOString().split('T')[0]
}
function monthStartStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

interface CreatePayoutFormProps {
  balance: DriverBalance
  onClose: () => void
}

function CreatePayoutForm({ balance, onClose }: CreatePayoutFormProps) {
  const [pending, startTransition] = useTransition()
  const [periodStart, setPeriodStart] = useState(monthStartStr())
  const [periodEnd, setPeriodEnd] = useState(todayStr())
  const [amountVnd, setAmountVnd] = useState(balance.netBalanceVnd)

  function handleSubmit() {
    startTransition(async () => {
      const result = await createPayout({
        driverId: balance.driverId,
        amountVnd,
        periodStart,
        periodEnd,
      })
      if (result.error) toast.error(result.error)
      else {
        toast.success(
          `Payout of ${amountVnd.toLocaleString('vi-VN')} ₫ created for ${balance.driverName}`,
        )
        onClose()
      }
    })
  }

  return (
    <div className="space-y-5">
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-[13px]">
        {[
          ['Driver', balance.driverName],
          ['Bank', balance.bankAccountNumber ?? '—'],
          ['Acct Name', balance.bankAccountName ?? '—'],
          ['BIN', balance.bankBin ?? '—'],
        ].map(([k, v]) => (
          <div key={k}>
            <dt className="text-[11px] font-bold tracking-[1px] text-[#666666] uppercase">{k}</dt>
            <dd className="mt-0.5 font-mono text-[12px] text-[#1a1a1a]">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-[11px] font-bold tracking-[2px] text-[#666666] uppercase">
            Amount (VND)
          </label>
          <input
            type="number"
            value={amountVnd}
            min={1}
            onChange={(e) => setAmountVnd(Number(e.target.value))}
            className="focus:ring-primary w-full rounded border border-[#cbccc9] px-3 py-2 font-mono text-[13px] text-[#1a1a1a] focus:ring-2 focus:outline-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-[11px] font-bold tracking-[2px] text-[#666666] uppercase">
              Period Start
            </label>
            <input
              type="date"
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
              className="focus:ring-primary w-full rounded border border-[#cbccc9] px-3 py-2 text-[13px] text-[#1a1a1a] focus:ring-2 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-bold tracking-[2px] text-[#666666] uppercase">
              Period End
            </label>
            <input
              type="date"
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
              className="focus:ring-primary w-full rounded border border-[#cbccc9] px-3 py-2 text-[13px] text-[#1a1a1a] focus:ring-2 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-[#cbccc9] pt-3">
        <button
          disabled={pending || amountVnd <= 0}
          onClick={handleSubmit}
          className="flex w-full items-center justify-center gap-2 rounded bg-green-600 px-4 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-green-700 disabled:opacity-50"
        >
          <CheckCircle className="size-4" aria-hidden="true" />
          {pending ? 'Creating…' : 'Confirm Payout'}
        </button>
      </div>
    </div>
  )
}

// ─── Payout History Table ──────────────────────────────────────────────────

interface PayoutHistoryProps {
  rows: PayoutRow[]
}

export function PayoutHistoryTable({ rows }: PayoutHistoryProps) {
  const [pending, startTransition] = useTransition()

  function handleMarkPaid(payoutId: string, driverName: string) {
    startTransition(async () => {
      const result = await markPayoutPaid({ payoutId })
      if (result.error) toast.error(result.error)
      else toast.success(`Payout for ${driverName} marked as paid`)
    })
  }

  return (
    <SectionShell title={`Payout History (${rows.length})`}>
      {rows.length === 0 ? (
        <EmptyState
          kicker="empty"
          title="No Payouts"
          helper="Payout records will appear here once created."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="bg-[#f7f8fa]">
              <tr>
                {['Driver', 'Period', 'Amount', 'Status', 'Paid At', ''].map((h) => (
                  <th
                    key={h}
                    className="border-b border-[#cbccc9] px-4 py-3 text-left text-[12px] font-extrabold tracking-[1.5px] text-[#1a1a1a] uppercase"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={row.id}
                  className={`border-b border-[#cbccc9] last:border-0 ${i % 2 === 1 ? 'bg-[#f7f8fa]' : ''}`}
                >
                  <td className="px-4 py-3 font-medium text-[#1a1a1a]">{row.driverName}</td>
                  <td className="px-4 py-3 font-mono text-[12px] text-[#666666]">
                    {row.periodStart} → {row.periodEnd}
                  </td>
                  <td className="px-4 py-3 font-mono text-[12px] font-bold text-[#1a1a1a]">
                    {row.amountVnd.toLocaleString('vi-VN')} ₫
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-[11px] font-bold tracking-[1px] uppercase ${STATUS_STYLES[row.status]}`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#666666]">
                    {row.paidAt ? row.paidAt.slice(0, 10) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {(row.status === 'pending' || row.status === 'processing') && (
                      <button
                        disabled={pending}
                        onClick={() => handleMarkPaid(row.id, row.driverName)}
                        className="rounded border border-[#cbccc9] px-3 py-1.5 text-[12px] font-medium text-[#1a1a1a] transition-colors hover:bg-[#f7f8fa] disabled:opacity-50"
                      >
                        Mark Paid
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SectionShell>
  )
}
