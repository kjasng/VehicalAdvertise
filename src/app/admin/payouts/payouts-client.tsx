'use client'

import { useMemo, useState, useTransition } from 'react'

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

type UserSearchFields = {
  driverName: string
  email: string | null
  phone: string | null
  bankAccountNumber: string | null
  bankAccountName: string | null
  bankBin: string | null
}

function matchesUserSearch(row: UserSearchFields, query: string) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return [
    row.driverName,
    row.email,
    row.phone,
    row.bankAccountNumber,
    row.bankAccountName,
    row.bankBin,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .includes(q)
}

function quarterKey(date: string) {
  const [year, month] = date.slice(0, 10).split('-')
  const monthNumber = Number(month)
  if (!year || !monthNumber) return ''
  return `${year}-Q${Math.floor((monthNumber - 1) / 3) + 1}`
}

function quarterLabel(key: string) {
  const [year, quarter] = key.split('-Q')
  return `${year} Q${quarter}`
}

// ─── Driver Balances ───────────────────────────────────────────────────────

interface DriverBalancesProps {
  balances: DriverBalance[]
}

export function DriverBalancesTable({ balances }: DriverBalancesProps) {
  const [selected, setSelected] = useState<DriverBalance | null>(null)
  const [search, setSearch] = useState('')
  const filteredBalances = useMemo(
    () => balances.filter((balance) => matchesUserSearch(balance, search)),
    [balances, search],
  )

  if (balances.length === 0)
    return (
      <SectionShell title="Driver Withdrawal Requests">
        <EmptyState
          kicker="empty"
          title="No Driver Requests"
          helper="Driver withdrawal invoices will appear here for manual approval."
        />
      </SectionShell>
    )

  return (
    <>
      <SectionShell
        title={`Driver Withdrawal Requests (${filteredBalances.length}/${balances.length})`}
      >
        <div className="mb-4">
          <label className="mb-1 block text-[11px] font-bold tracking-[2px] text-[#666666] uppercase">
            Search user
          </label>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name, email, phone, bank account..."
            className="focus:ring-primary h-[40px] w-full max-w-xl rounded border border-[#cbccc9] px-3 text-[13px] text-[#1a1a1a] focus:ring-2 focus:outline-none"
          />
        </div>
        {filteredBalances.length === 0 ? (
          <EmptyState
            kicker="empty"
            title="No Matching Drivers"
            helper="Try another name, email, phone, or bank account."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead className="bg-[#f7f8fa]">
                <tr>
                  {['Driver', 'Invoice', 'Bank Account', 'Request Amount', 'Net Balance', ''].map(
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
                {filteredBalances.map((b, i) => (
                  <tr
                    key={b.invoiceId}
                    className={`border-b border-[#cbccc9] last:border-0 ${i % 2 === 1 ? 'bg-[#f7f8fa]' : ''}`}
                  >
                    <td className="px-4 py-3 font-medium text-[#1a1a1a]">{b.driverName}</td>
                    <td className="px-4 py-3 font-mono text-[12px] text-[#666666]">
                      {b.invoiceNumber}
                    </td>
                    <td className="px-4 py-3 font-mono text-[12px] text-[#666666]">
                      {b.bankAccountNumber ?? '—'}
                      {b.bankAccountName && (
                        <span className="ml-1 text-[#999]">({b.bankAccountName})</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-[12px] font-bold text-[#1a1a1a]">
                      {b.requestedAmountVnd.toLocaleString('vi-VN')} ₫
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
                        Approve
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionShell>

      <ReviewDrawer
        open={selected !== null}
        onOpenChange={(o) => {
          if (!o) setSelected(null)
        }}
        title="Approve Driver Withdrawal"
      >
        {selected && <CreatePayoutForm balance={selected} onClose={() => setSelected(null)} />}
      </ReviewDrawer>
    </>
  )
}

// ─── Create Payout Form (inside drawer) ───────────────────────────────────

interface CreatePayoutFormProps {
  balance: DriverBalance
  onClose: () => void
}

function CreatePayoutForm({ balance, onClose }: CreatePayoutFormProps) {
  const [pending, startTransition] = useTransition()

  function handleSubmit() {
    startTransition(async () => {
      const result = await createPayout({ invoiceId: balance.invoiceId })
      if (result.error) toast.error(result.error)
      else {
        toast.success(
          `Withdrawal of ${balance.requestedAmountVnd.toLocaleString('vi-VN')} ₫ approved for ${balance.driverName}`,
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
          ['Invoice', balance.invoiceNumber],
          ['Bank', balance.bankAccountNumber ?? '—'],
          ['Acct Name', balance.bankAccountName ?? '—'],
          ['BIN', balance.bankBin ?? '—'],
          ['Period', `${balance.periodStart} → ${balance.periodEnd}`],
        ].map(([k, v]) => (
          <div key={k}>
            <dt className="text-[11px] font-bold tracking-[1px] text-[#666666] uppercase">{k}</dt>
            <dd className="mt-0.5 font-mono text-[12px] text-[#1a1a1a]">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="space-y-3">
        <p className="rounded border border-[#cbccc9] bg-[#f7f8fa] p-3 text-[13px] text-[#666666]">
          Approving reserves the balance for manual bank transfer. Mark it paid only after the
          transfer succeeds.
        </p>
        <p className="font-heading text-[28px] leading-none text-[#1a1a1a]">
          {balance.requestedAmountVnd.toLocaleString('vi-VN')} ₫
        </p>
      </div>

      <div className="border-t border-[#cbccc9] pt-3">
        <button
          disabled={pending}
          onClick={handleSubmit}
          className="flex w-full items-center justify-center gap-2 rounded bg-green-600 px-4 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-green-700 disabled:opacity-50"
        >
          <CheckCircle className="size-4" aria-hidden="true" />
          {pending ? 'Approving…' : 'Approve Withdrawal'}
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
  const [search, setSearch] = useState('')
  const [month, setMonth] = useState('')
  const [quarter, setQuarter] = useState('')
  const quarterOptions = useMemo(
    () =>
      Array.from(new Set(rows.map((row) => quarterKey(row.periodStart)).filter(Boolean))).sort(
        (a, b) => b.localeCompare(a),
      ),
    [rows],
  )
  const filteredRows = useMemo(
    () =>
      rows.filter((row) => {
        const periodMonth = row.periodStart.slice(0, 7)
        const matchesPeriod = month
          ? periodMonth === month
          : !quarter || quarterKey(row.periodStart) === quarter
        return matchesPeriod && matchesUserSearch(row, search)
      }),
    [month, quarter, rows, search],
  )

  function handleMarkPaid(payoutId: string, driverName: string) {
    startTransition(async () => {
      const result = await markPayoutPaid({ payoutId })
      if (result.error) toast.error(result.error)
      else toast.success(`Payout for ${driverName} marked as paid`)
    })
  }

  return (
    <SectionShell title={`Payout History (${filteredRows.length}/${rows.length})`}>
      {rows.length === 0 ? (
        <EmptyState
          kicker="empty"
          title="No Payouts"
          helper="Payout records will appear here once created."
        />
      ) : (
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-[minmax(220px,1fr)_160px_160px]">
            <div>
              <label className="mb-1 block text-[11px] font-bold tracking-[2px] text-[#666666] uppercase">
                Search user
              </label>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Name, email, phone, bank account..."
                className="focus:ring-primary h-[40px] w-full rounded border border-[#cbccc9] px-3 text-[13px] text-[#1a1a1a] focus:ring-2 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-bold tracking-[2px] text-[#666666] uppercase">
                Month
              </label>
              <input
                type="month"
                value={month}
                onChange={(e) => {
                  setMonth(e.target.value)
                  if (e.target.value) setQuarter('')
                }}
                className="focus:ring-primary h-[40px] w-full rounded border border-[#cbccc9] px-3 text-[13px] text-[#1a1a1a] focus:ring-2 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-bold tracking-[2px] text-[#666666] uppercase">
                Quarter
              </label>
              <select
                value={quarter}
                onChange={(e) => {
                  setQuarter(e.target.value)
                  if (e.target.value) setMonth('')
                }}
                className="focus:ring-primary h-[40px] w-full rounded border border-[#cbccc9] bg-white px-3 text-[13px] text-[#1a1a1a] focus:ring-2 focus:outline-none"
              >
                <option value="">All quarters</option>
                {quarterOptions.map((option) => (
                  <option key={option} value={option}>
                    {quarterLabel(option)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filteredRows.length === 0 ? (
            <EmptyState
              kicker="empty"
              title="No Matching Payouts"
              helper="Try another period or user search."
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
                  {filteredRows.map((row, i) => (
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
        </div>
      )}
    </SectionShell>
  )
}
