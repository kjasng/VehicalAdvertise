'use client'

import { useState, useTransition } from 'react'

import { CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'

import { DataTable } from '@/components/admin/data-table'
import { RejectReasonModal } from '@/components/admin/reject-reason-modal'
import { ReviewDrawer } from '@/components/admin/review-drawer'
import { EmptyState } from '@/components/shared/empty-state'
import { SectionShell } from '@/components/shared/section-shell'
import type { PartnerApprovalRow } from '@/lib/admin/queries-partners-approval'

import { approvePartner, rejectPartner } from './actions'

interface Props {
  rows: PartnerApprovalRow[]
}

function PartnerReviewContent({ row, onClose }: { row: PartnerApprovalRow; onClose: () => void }) {
  const [pending, startTransition] = useTransition()
  const [showRejectModal, setShowRejectModal] = useState(false)

  function handleApprove() {
    startTransition(async () => {
      const r = await approvePartner({ partnerId: row.id })
      if (r.error) toast.error(r.error)
      else {
        toast.success(`${row.companyName} approved`)
        onClose()
      }
    })
  }

  function handleRejectConfirm(reason: string) {
    startTransition(async () => {
      const r = await rejectPartner({ partnerId: row.id, reason })
      if (r.error) toast.error(r.error)
      else {
        toast.success(`${row.companyName} rejected`)
        setShowRejectModal(false)
        onClose()
      }
    })
  }

  return (
    <div className="space-y-5">
      <section className="space-y-2">
        <p className="text-[11px] font-bold tracking-[2.5px] text-[#666666] uppercase">
          Thông tin công ty
        </p>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-[13px]">
          {(
            [
              ['Công ty', row.companyName],
              ['MST', row.taxCode ?? '—'],
              ['Liên hệ', row.partnerName],
              ['Email', row.partnerEmail ?? '—'],
            ] as [string, string][]
          ).map(([label, value]) => (
            <div key={label}>
              <dt className="text-[11px] font-bold tracking-[1px] text-[#666666] uppercase">
                {label}
              </dt>
              <dd className="mt-0.5 text-[#1a1a1a]">{value}</dd>
            </div>
          ))}
        </dl>
        {row.billingAddress && (
          <div>
            <dt className="text-[11px] font-bold tracking-[1px] text-[#666666] uppercase">
              Địa chỉ hóa đơn
            </dt>
            <dd className="mt-0.5 text-[13px] text-[#1a1a1a]">{row.billingAddress}</dd>
          </div>
        )}
      </section>

      <div className="flex gap-3 border-t border-[#cbccc9] pt-2">
        <button
          disabled={pending}
          onClick={handleApprove}
          className="flex flex-1 items-center justify-center gap-2 rounded bg-green-600 px-4 py-2.5 text-[13px] font-bold text-white hover:bg-green-700 disabled:opacity-50"
        >
          <CheckCircle className="size-4" /> Approve
        </button>
        <button
          disabled={pending}
          onClick={() => setShowRejectModal(true)}
          className="flex flex-1 items-center justify-center gap-2 rounded border border-red-300 bg-white px-4 py-2.5 text-[13px] font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          <XCircle className="size-4" /> Reject
        </button>
      </div>

      {showRejectModal && (
        <RejectReasonModal
          title={`Từ chối hồ sơ — ${row.companyName}`}
          onConfirm={handleRejectConfirm}
          onClose={() => setShowRejectModal(false)}
          pending={pending}
        />
      )}
    </div>
  )
}

export function PartnerApprovalQueueClient({ rows }: Props) {
  const [selected, setSelected] = useState<PartnerApprovalRow | null>(null)

  const columns = [
    {
      key: 'companyName' as const,
      header: 'Company',
      sortValue: (r: PartnerApprovalRow) => r.companyName,
      cell: (r: PartnerApprovalRow) => (
        <span className="font-medium text-[#1a1a1a]">{r.companyName}</span>
      ),
    },
    { key: 'taxCode' as const, header: 'MST', cell: (r: PartnerApprovalRow) => r.taxCode ?? '—' },
    {
      key: 'partnerName' as const,
      header: 'Contact',
      sortValue: (r: PartnerApprovalRow) => r.partnerName,
    },
    {
      key: 'partnerEmail' as const,
      header: 'Email',
      cell: (r: PartnerApprovalRow) => (
        <span className="text-[#666666]">{r.partnerEmail ?? '—'}</span>
      ),
    },
    {
      key: 'submittedAt' as const,
      header: 'Submitted',
      sortValue: (r: PartnerApprovalRow) => r.submittedAt,
      cell: (r: PartnerApprovalRow) => (
        <span className="text-[#666666]">{r.submittedAt.slice(0, 10)}</span>
      ),
    },
  ]

  return (
    <>
      <SectionShell title={`Pending Review (${rows.length})`}>
        {rows.length === 0 ? (
          <EmptyState
            kicker="empty"
            title="All Clear"
            helper="No partner applications pending review."
          />
        ) : (
          <DataTable
            rows={rows}
            columns={columns}
            rowKey={(r) => r.id}
            rowAction={(r) => setSelected(r)}
            emptyMessage="No pending applications."
          />
        )}
      </SectionShell>

      <ReviewDrawer
        open={selected !== null}
        onOpenChange={(o) => {
          if (!o) setSelected(null)
        }}
        title="Partner Review"
      >
        {selected && <PartnerReviewContent row={selected} onClose={() => setSelected(null)} />}
      </ReviewDrawer>
    </>
  )
}
