'use client'

import { useState } from 'react'

import { CreativeReviewContent } from '@/components/admin/creative-review-content'
import { DataTable } from '@/components/admin/data-table'
import { ReviewDrawer } from '@/components/admin/review-drawer'
import { EmptyState } from '@/components/shared/empty-state'
import { SectionShell } from '@/components/shared/section-shell'
import type { CreativeQueueRow } from '@/lib/admin/queries-creatives'

interface CreativesQueueClientProps {
  rows: CreativeQueueRow[]
}

export function CreativesQueueClient({ rows }: CreativesQueueClientProps) {
  const [selected, setSelected] = useState<CreativeQueueRow | null>(null)

  const columns = [
    {
      key: 'campaignName' as const,
      header: 'Campaign',
      sortValue: (r: CreativeQueueRow) => r.campaignName,
      cell: (r: CreativeQueueRow) => (
        <span className="font-medium text-[#1a1a1a]">{r.campaignName}</span>
      ),
    },
    {
      key: 'partnerName' as const,
      header: 'Partner',
      sortValue: (r: CreativeQueueRow) => r.partnerName,
    },
    {
      key: 'submittedAt' as const,
      header: 'Submitted',
      sortValue: (r: CreativeQueueRow) => r.submittedAt,
    },
    {
      key: 'budgetVnd' as const,
      header: 'Budget',
      sortValue: (r: CreativeQueueRow) => r.budgetVnd,
      cell: (r: CreativeQueueRow) => (
        <span className="font-mono text-[13px]">{(r.budgetVnd / 1_000_000).toFixed(1)}M</span>
      ),
    },
    {
      key: 'status' as const,
      header: 'Status',
      cell: (r: CreativeQueueRow) => (
        <span className="inline-block rounded bg-yellow-100 px-2 py-0.5 text-[11px] font-bold tracking-[1px] text-yellow-700 uppercase">
          {r.status}
        </span>
      ),
    },
  ]

  return (
    <>
      <SectionShell title={`Pending Approval (${rows.length})`}>
        {rows.length === 0 ? (
          <EmptyState
            kicker="empty"
            title="No Creatives"
            helper="No campaign creatives are pending review."
          />
        ) : (
          <DataTable
            rows={rows}
            columns={columns}
            rowKey={(r) => r.id}
            rowAction={(r) => setSelected(r)}
            emptyMessage="No creatives pending review."
          />
        )}
      </SectionShell>

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
