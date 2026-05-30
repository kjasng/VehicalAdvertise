'use client'

import { useState } from 'react'

import { DataTable } from '@/components/admin/data-table'
import { KycReviewContent } from '@/components/admin/kyc-review-content'
import { ReviewDrawer } from '@/components/admin/review-drawer'
import { EmptyState } from '@/components/shared/empty-state'
import { SectionShell } from '@/components/shared/section-shell'
import type { KycQueueRow } from '@/lib/admin/queries-kyc'

interface KycQueueClientProps {
  rows: KycQueueRow[]
}

const KYC_STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-600',
}

export function KycQueueClient({ rows }: KycQueueClientProps) {
  const [selected, setSelected] = useState<KycQueueRow | null>(null)

  const columns = [
    {
      key: 'fullName' as const,
      header: 'Name',
      sortValue: (r: KycQueueRow) => r.fullName,
      cell: (r: KycQueueRow) => <span className="font-medium text-[#1a1a1a]">{r.fullName}</span>,
    },
    { key: 'phone' as const, header: 'Phone' },
    {
      key: 'district' as const,
      header: 'District',
      sortValue: (r: KycQueueRow) => r.district ?? '',
    },
    {
      key: 'submittedAt' as const,
      header: 'Submitted',
      sortValue: (r: KycQueueRow) => r.submittedAt,
    },
    {
      key: 'kycStatus' as const,
      header: 'Status',
      cell: (r: KycQueueRow) => (
        <span
          className={`inline-block rounded px-2 py-0.5 text-[11px] font-bold tracking-[1px] uppercase ${KYC_STATUS_STYLES[r.kycStatus] ?? ''}`}
        >
          {r.kycStatus}
        </span>
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
            helper="No driver KYC submissions are pending review."
          />
        ) : (
          <DataTable
            rows={rows}
            columns={columns}
            rowKey={(r) => r.id}
            rowAction={(r) => setSelected(r)}
            emptyMessage="No pending KYC submissions."
          />
        )}
      </SectionShell>

      <ReviewDrawer
        open={selected !== null}
        onOpenChange={(o) => {
          if (!o) setSelected(null)
        }}
        title="KYC Review"
      >
        {selected && <KycReviewContent row={selected} onClose={() => setSelected(null)} />}
      </ReviewDrawer>
    </>
  )
}
