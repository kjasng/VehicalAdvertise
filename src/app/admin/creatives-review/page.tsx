'use client'

/**
 * Creatives Review — campaign creative artwork review queue.
 * Row click opens ReviewDrawer with image preview + spec list.
 */
import { useState } from 'react'

import { CreativeReviewContent } from '@/components/admin/creative-review-content'
import { DataTable } from '@/components/admin/data-table'
import type { CreativeRow } from '@/components/admin/mock-data'
import { MOCK_CREATIVE_ROWS } from '@/components/admin/mock-data'
import { ReviewDrawer } from '@/components/admin/review-drawer'
import { PageHeader } from '@/components/shared/page-header'
import { SectionShell } from '@/components/shared/section-shell'

export default function CreativesReviewPage() {
  const [selected, setSelected] = useState<CreativeRow | null>(null)

  const columns = [
    {
      key: 'campaignName' as const,
      header: 'Campaign',
      sortValue: (r: CreativeRow) => r.campaignName,
      cell: (r: CreativeRow) => (
        <span className="font-medium text-[#1a1a1a]">{r.campaignName}</span>
      ),
    },
    { key: 'partner' as const, header: 'Partner', sortValue: (r: CreativeRow) => r.partner },
    {
      key: 'submittedAt' as const,
      header: 'Submitted',
      sortValue: (r: CreativeRow) => r.submittedAt,
    },
    {
      key: 'widthPx' as const,
      header: 'Dimensions',
      cell: (r: CreativeRow) => `${r.widthPx} × ${r.heightPx} px`,
    },
    {
      key: 'fileSizeKb' as const,
      header: 'Size',
      cell: (r: CreativeRow) => `${r.fileSizeKb} KB`,
      sortValue: (r: CreativeRow) => r.fileSizeKb,
    },
    {
      key: 'status' as const,
      header: 'Status',
      cell: (r: CreativeRow) => (
        <span className="inline-block rounded bg-yellow-100 px-2 py-0.5 text-[11px] font-bold tracking-[1px] text-yellow-700 uppercase">
          {r.status}
        </span>
      ),
    },
  ]

  return (
    <>
      <div className="space-y-6">
        <PageHeader kicker="Operations" title="Creatives Review" />
        <SectionShell title={`Pending Approval (${MOCK_CREATIVE_ROWS.length})`}>
          <DataTable
            rows={MOCK_CREATIVE_ROWS}
            columns={columns}
            rowKey={(r) => r.id}
            rowAction={(r) => setSelected(r)}
            emptyMessage="No creatives pending review."
          />
        </SectionShell>
      </div>

      <ReviewDrawer
        open={selected !== null}
        onOpenChange={(o) => {
          if (!o) setSelected(null)
        }}
        title="Creative Review"
      >
        {selected && <CreativeReviewContent row={selected} onClose={() => setSelected(null)} />}
      </ReviewDrawer>
    </>
  )
}
