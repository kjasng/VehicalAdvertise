'use client'

import { useState } from 'react'

import Image from 'next/image'

import { PhotoVerifReviewContent } from '@/components/admin/photo-verif-review-content'
import { ReviewDrawer } from '@/components/admin/review-drawer'
import { DataTable } from '@/components/admin/data-table'
import { EmptyState } from '@/components/shared/empty-state'
import { SectionShell } from '@/components/shared/section-shell'
import type { PhotoVerifRow } from '@/lib/admin/queries-photos'

interface Props {
  rows: PhotoVerifRow[]
}

const DISPOSITION_STYLES: Record<string, string> = {
  auto: 'bg-blue-100 text-blue-700',
  manual: 'bg-yellow-100 text-yellow-700',
}

const RESULT_STYLES: Record<string, string> = {
  pass: 'bg-green-100 text-green-700',
  fail: 'bg-red-100 text-red-600',
  pending: 'bg-yellow-100 text-yellow-700',
}

export function PhotoVerifQueueClient({ rows }: Props) {
  const [selected, setSelected] = useState<PhotoVerifRow | null>(null)

  const columns = [
    {
      key: 'signedPhotoUrl' as const,
      header: 'Photo',
      cell: (r: PhotoVerifRow) => (
        <Image
          src={r.signedPhotoUrl ?? '/placeholder-photo.png'}
          alt={`Photo — ${r.driverName}`}
          width={56}
          height={56}
          className="rounded border border-[#cbccc9] object-cover"
          unoptimized
        />
      ),
    },
    {
      key: 'driverName' as const,
      header: 'Driver',
      sortValue: (r: PhotoVerifRow) => r.driverName,
      cell: (r: PhotoVerifRow) => (
        <span className="font-medium text-[#1a1a1a]">{r.driverName}</span>
      ),
    },
    {
      key: 'promptDate' as const,
      header: 'Date',
      sortValue: (r: PhotoVerifRow) => r.promptDate,
      cell: (r: PhotoVerifRow) => (
        <span className="text-[#666666]">{r.promptDate.slice(0, 10)}</span>
      ),
    },
    {
      key: 'disposition' as const,
      header: 'Disposition',
      cell: (r: PhotoVerifRow) => (
        <span
          className={`inline-block rounded px-2 py-0.5 text-[11px] font-bold tracking-[1px] uppercase ${DISPOSITION_STYLES[r.disposition] ?? ''}`}
        >
          {r.disposition}
        </span>
      ),
    },
    {
      key: 'dispositionResult' as const,
      header: 'Result',
      cell: (r: PhotoVerifRow) => (
        <span
          className={`inline-block rounded px-2 py-0.5 text-[11px] font-bold tracking-[1px] uppercase ${RESULT_STYLES[r.dispositionResult] ?? ''}`}
        >
          {r.dispositionResult}
        </span>
      ),
    },
  ]

  return (
    <>
      <SectionShell title={`Queue (${rows.length})`}>
        {rows.length === 0 ? (
          <EmptyState
            kicker="empty"
            title="No Verifications"
            helper="No photo verifications are in the queue."
          />
        ) : (
          <DataTable
            rows={rows}
            columns={columns}
            rowKey={(r) => r.id}
            rowAction={(r) => setSelected(r)}
            emptyMessage="No photo verifications found."
          />
        )}
      </SectionShell>

      <ReviewDrawer
        open={selected !== null}
        onOpenChange={(o) => {
          if (!o) setSelected(null)
        }}
        title="Photo Verification Review"
      >
        {selected && <PhotoVerifReviewContent row={selected} onClose={() => setSelected(null)} />}
      </ReviewDrawer>
    </>
  )
}
