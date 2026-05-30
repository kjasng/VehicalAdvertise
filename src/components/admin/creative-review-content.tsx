'use client'

/**
 * CreativeReviewContent — drawer body for a campaign creative review.
 * Accepts CreativeQueueRow (real data); imageUrl may be null.
 */
import Image from 'next/image'

import { CheckCircle, XCircle } from 'lucide-react'
import { useTransition } from 'react'
import { toast } from 'sonner'

import { reviewCampaign } from '@/app/admin/creatives-review/actions'
import type { CreativeQueueRow } from '@/lib/admin/queries-creatives'

interface CreativeReviewContentProps {
  row: CreativeQueueRow
  onClose: () => void
}

export function CreativeReviewContent({ row, onClose }: CreativeReviewContentProps) {
  const [pending, startTransition] = useTransition()

  function handleDecision(decision: 'approved' | 'rejected') {
    startTransition(async () => {
      const result = await reviewCampaign({ campaignId: row.id, decision })
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`Creative ${decision}: ${row.campaignName}`)
        onClose()
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Preview */}
      <section className="space-y-2">
        <p className="text-[11px] font-bold tracking-[2.5px] text-[#666666] uppercase">Preview</p>
        {row.imageUrl ? (
          <Image
            src={row.imageUrl}
            alt={`Creative preview for ${row.campaignName}`}
            width={400}
            height={200}
            className="h-auto w-full rounded border border-[#cbccc9]"
            unoptimized
          />
        ) : (
          <div className="flex h-[120px] items-center justify-center rounded border border-dashed border-[#cbccc9] text-[13px] text-[#666666]">
            No creative uploaded yet
          </div>
        )}
      </section>

      {/* Specs */}
      <section className="space-y-2">
        <p className="text-[11px] font-bold tracking-[2.5px] text-[#666666] uppercase">Details</p>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-[13px]">
          {[
            ['Campaign', row.campaignName],
            ['Partner', row.partnerName],
            ['Submitted', row.submittedAt],
            ['Budget', `${(row.budgetVnd / 1_000_000).toFixed(1)}M VND`],
            ['Status', row.status],
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
          disabled={pending}
          onClick={() => handleDecision('approved')}
          className="flex flex-1 items-center justify-center gap-2 rounded bg-green-600 px-4 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-green-700 focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:outline-none disabled:opacity-50"
          aria-label={`Approve creative for ${row.campaignName}`}
        >
          <CheckCircle className="size-4" aria-hidden="true" />
          Approve
        </button>
        <button
          disabled={pending}
          onClick={() => handleDecision('rejected')}
          className="flex flex-1 items-center justify-center gap-2 rounded border border-red-300 bg-white px-4 py-2.5 text-[13px] font-bold text-red-600 transition-colors hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none disabled:opacity-50"
          aria-label={`Reject creative for ${row.campaignName}`}
        >
          <XCircle className="size-4" aria-hidden="true" />
          Reject
        </button>
      </div>
    </div>
  )
}
