'use client'

import { useMemo, useState, useTransition } from 'react'

import { toast } from 'sonner'

import { EmptyState } from '@/components/shared/empty-state'
import { SectionShell } from '@/components/shared/section-shell'
import type { WithdrawalRequestRow } from '@/lib/admin/queries-withdrawal-requests'

import { createPayout, markPayoutPaid, reviewGarageWithdrawal } from './actions'
import { RejectGarageWithdrawalDrawer } from './reject-garage-withdrawal-drawer'
import { RequestsTable } from './withdrawal-requests-grid'

type WithdrawalRequestsTableProps = {
  rows: WithdrawalRequestRow[]
  title?: string
  lockedRole?: WithdrawalRequestRow['role']
  emptyTitle?: string
  emptyHelper?: string
}

export function WithdrawalRequestsTable({
  rows,
  title = 'Withdrawal Requests',
  lockedRole,
  emptyTitle = 'No Withdrawal Requests',
  emptyHelper = 'Driver and garage withdrawal requests will appear here.',
}: WithdrawalRequestsTableProps) {
  const [pending, startTransition] = useTransition()
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const [month, setMonth] = useState('')
  const [rejecting, setRejecting] = useState<WithdrawalRequestRow | null>(null)
  const activeRole = lockedRole ?? role

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return rows.filter((row) => {
      if (activeRole && row.role !== activeRole) return false
      if (month && row.createdAt.slice(0, 7) !== month) return false
      if (!query) return true
      return [
        row.reference,
        row.actorName,
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
  }, [activeRole, month, rows, search])

  function runAction(row: WithdrawalRequestRow, action: 'approve' | 'paid') {
    startTransition(async () => {
      const result =
        row.role === 'driver'
          ? action === 'approve'
            ? await createPayout({ invoiceId: row.sourceId })
            : await markPayoutPaid({ payoutId: row.payoutId })
          : await reviewGarageWithdrawal({
              withdrawalId: row.sourceId,
              decision: action === 'approve' ? 'approved' : 'paid',
            })
      if (result.error) toast.error(result.error)
      else toast.success(`${row.actorName} withdrawal updated`)
    })
  }

  return (
    <>
      <SectionShell title={`${title} (${filtered.length}/${rows.length})`}>
        {rows.length === 0 ? (
          <EmptyState kicker="empty" title={emptyTitle} helper={emptyHelper} />
        ) : (
          <div className="space-y-4">
            <div
              className={
                lockedRole
                  ? 'grid gap-3 md:grid-cols-[minmax(220px,1fr)_160px]'
                  : 'grid gap-3 md:grid-cols-[minmax(220px,1fr)_150px_160px]'
              }
            >
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Name, email, phone, bank account..."
                className="focus:ring-primary h-10 rounded border border-[#cbccc9] px-3 text-[13px] focus:ring-2 focus:outline-none"
              />
              {!lockedRole && (
                <select
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                  className="focus:ring-primary h-10 rounded border border-[#cbccc9] bg-white px-3 text-[13px] focus:ring-2 focus:outline-none"
                >
                  <option value="">All roles</option>
                  <option value="driver">Driver</option>
                  <option value="garage">Garage</option>
                </select>
              )}
              <input
                type="month"
                value={month}
                onChange={(event) => setMonth(event.target.value)}
                className="focus:ring-primary h-10 rounded border border-[#cbccc9] px-3 text-[13px] focus:ring-2 focus:outline-none"
              />
            </div>

            {filtered.length === 0 ? (
              <EmptyState
                kicker="empty"
                title="No Matching Requests"
                helper={
                  lockedRole
                    ? 'Try another month or search keyword.'
                    : 'Try another role, month, or search keyword.'
                }
              />
            ) : (
              <RequestsTable
                rows={filtered}
                pending={pending}
                onAction={runAction}
                onReject={setRejecting}
              />
            )}
          </div>
        )}
      </SectionShell>

      <RejectGarageWithdrawalDrawer row={rejecting} onClose={() => setRejecting(null)} />
    </>
  )
}
