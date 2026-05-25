'use client'

/**
 * CreativeReviewContent — drawer body for a creative review.
 * Shows image preview + spec list + approve/reject stub actions.
 */
import Image from 'next/image'

import { CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'

import type { CreativeRow } from './mock-data'

interface CreativeReviewContentProps {
  row: CreativeRow
  onClose: () => void
}

export function CreativeReviewContent({ row, onClose }: CreativeReviewContentProps) {
  function handleApprove() {
    console.log('[STUB] approve creative', row.id)
    toast.success(`Creative approved: ${row.campaignName}`)
    onClose()
  }

  function handleReject() {
    console.log('[STUB] reject creative', row.id)
    toast.error(`Creative rejected: ${row.campaignName}`)
    onClose()
  }

  return (
    <div className="space-y-6">
      {/* Preview */}
      <section className="space-y-2">
        <p className="text-[11px] font-bold tracking-[1.5px] text-[#666666] uppercase">Preview</p>
        <Image
          src={row.imageUrl}
          alt={`Creative preview for ${row.campaignName}`}
          width={400}
          height={200}
          className="h-auto w-full rounded border border-[#cbccc9]"
          unoptimized
        />
      </section>

      {/* Specs */}
      <section className="space-y-2">
        <p className="text-[11px] font-bold tracking-[1.5px] text-[#666666] uppercase">Specs</p>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-[13px]">
          {[
            ['Campaign', row.campaignName],
            ['Partner', row.partner],
            ['Submitted', row.submittedAt],
            ['Dimensions', `${row.widthPx} × ${row.heightPx} px`],
            ['DPI', String(row.dpi)],
            ['File size', `${row.fileSizeKb} KB`],
            ['Print area', `${row.areaM2} m²`],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-[11px] font-bold tracking-[1px] text-[#666666] uppercase">
                {label}
              </dt>
              <dd className="mt-0.5 text-[#1a1a1a]">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Actions */}
      <div className="flex gap-3 border-t border-[#cbccc9] pt-2">
        <button
          onClick={handleApprove}
          className="flex flex-1 items-center justify-center gap-2 rounded bg-green-600 px-4 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-green-700 focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:outline-none"
          aria-label={`Approve creative for ${row.campaignName}`}
        >
          <CheckCircle className="size-4" aria-hidden="true" />
          Approve
        </button>
        <button
          onClick={handleReject}
          className="flex flex-1 items-center justify-center gap-2 rounded border border-red-300 bg-white px-4 py-2.5 text-[13px] font-bold text-red-600 transition-colors hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none"
          aria-label={`Reject creative for ${row.campaignName}`}
        >
          <XCircle className="size-4" aria-hidden="true" />
          Reject
        </button>
      </div>
    </div>
  )
}
