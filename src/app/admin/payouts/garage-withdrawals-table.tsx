'use client'

import { useMemo, useState, useTransition } from 'react'

import { toast } from 'sonner'

import { EmptyState } from '@/components/shared/empty-state'
import { SectionShell } from '@/components/shared/section-shell'
import type { GarageWithdrawalAdminRow } from '@/lib/admin/queries-payouts'

import { reviewGarageWithdrawal } from './actions'
import { GarageWithdrawalRow, RejectWithdrawalDrawer } from './garage-withdrawal-actions'

export function GarageWithdrawalsTable({ rows }: { rows: GarageWithdrawalAdminRow[] }) {
  const [pending, startTransition] = useTransition()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [rejecting, setRejecting] = useState<GarageWithdrawalAdminRow | null>(null)

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return rows.filter((row) => {
      if (status && row.status !== status) return false
      if (!query) return true
      return [
        row.withdrawalNumber,
        row.garageName,
        row.email,
        row.phone,
        row.bankAccountNumber,
        row.bankAccountName,
        row.bankName,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query)
    })
  }, [rows, search, status])

  function runDecision(row: GarageWithdrawalAdminRow, decision: 'approved' | 'paid') {
    startTransition(async () => {
      const result = await reviewGarageWithdrawal({ withdrawalId: row.id, decision })
      if (result.error) toast.error(result.error)
      else {
        toast.success(
          decision === 'approved'
            ? `${row.garageName} withdrawal approved for manual transfer`
            : `${row.garageName} withdrawal marked paid`,
        )
      }
    })
  }

  return (
    <>
      <SectionShell title={`Garage Withdrawal Requests (${filtered.length}/${rows.length})`}>
        {rows.length === 0 ? (
          <EmptyState
            kicker="empty"
            title="No Garage Withdrawals"
            helper="Garage withdrawal requests will appear here."
          />
        ) : (
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-[minmax(220px,1fr)_180px]">
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Garage, email, phone, bank account..."
                className="focus:ring-primary h-10 rounded border border-[#cbccc9] px-3 text-[13px] focus:ring-2 focus:outline-none"
              />
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="focus:ring-primary h-10 rounded border border-[#cbccc9] bg-white px-3 text-[13px] focus:ring-2 focus:outline-none"
              >
                <option value="">All statuses</option>
                {['pending', 'processing', 'paid', 'failed'].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {filtered.length === 0 ? (
              <EmptyState
                kicker="empty"
                title="No Matching Requests"
                helper="Try another garage, bank account, or status."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead className="bg-[#f7f8fa]">
                    <tr>
                      {['Garage', 'Bank Account', 'Amount', 'Requested', 'Status', 'Actions'].map(
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
                    {filtered.map((row) => (
                      <GarageWithdrawalRow
                        key={row.id}
                        row={row}
                        disabled={pending}
                        onApprove={() => runDecision(row, 'approved')}
                        onPaid={() => runDecision(row, 'paid')}
                        onReject={() => setRejecting(row)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </SectionShell>

      <RejectWithdrawalDrawer row={rejecting} onClose={() => setRejecting(null)} />
    </>
  )
}
