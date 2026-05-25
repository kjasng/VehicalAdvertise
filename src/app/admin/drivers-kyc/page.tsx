'use client'

/**
 * Drivers KYC — pending profile review queue.
 * Row click opens ReviewDrawer with CCCD photos + approve/reject.
 */
import { useState } from 'react'

import { DataTable } from '@/components/admin/data-table'
import { KycReviewContent } from '@/components/admin/kyc-review-content'
import type { KycRow } from '@/components/admin/mock-data'
import { MOCK_KYC_ROWS } from '@/components/admin/mock-data'
import { ReviewDrawer } from '@/components/admin/review-drawer'
import { PageHeader } from '@/components/shared/page-header'
import { SectionShell } from '@/components/shared/section-shell'

export default function DriversKycPage() {
  const [selected, setSelected] = useState<KycRow | null>(null)

  const columns = [
    {
      key: 'name' as const,
      header: 'Name',
      sortValue: (r: KycRow) => r.name,
      cell: (r: KycRow) => <span className="font-medium text-[#1a1a1a]">{r.name}</span>,
    },
    { key: 'phone' as const, header: 'Phone' },
    { key: 'cccdNumber' as const, header: 'CCCD No.' },
    { key: 'district' as const, header: 'District', sortValue: (r: KycRow) => r.district },
    { key: 'submittedAt' as const, header: 'Submitted', sortValue: (r: KycRow) => r.submittedAt },
    {
      key: 'status' as const,
      header: 'Status',
      cell: (r: KycRow) => (
        <span className="inline-block rounded bg-yellow-100 px-2 py-0.5 text-[11px] font-bold tracking-[1px] text-yellow-700 uppercase">
          {r.status}
        </span>
      ),
    },
  ]

  return (
    <>
      <div className="space-y-6">
        <PageHeader kicker="Operations" title="Drivers KYC" />
        <SectionShell title={`Pending Review (${MOCK_KYC_ROWS.length})`}>
          <DataTable
            rows={MOCK_KYC_ROWS}
            columns={columns}
            rowKey={(r) => r.id}
            rowAction={(r) => setSelected(r)}
            emptyMessage="No pending KYC submissions."
          />
        </SectionShell>
      </div>

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
