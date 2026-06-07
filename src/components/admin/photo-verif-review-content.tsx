'use client'

import Image from 'next/image'
import { useState, useTransition } from 'react'

import { CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'

import { reviewPhotoVerif } from '@/app/admin/photo-verifications/actions'
import { RejectReasonModal } from '@/components/admin/reject-reason-modal'
import type { PhotoVerifRow } from '@/lib/admin/queries-photos'

interface Props {
  row: PhotoVerifRow
  onClose: () => void
}

const RESULT_LABEL: Record<PhotoVerifRow['dispositionResult'], string> = {
  pass: 'Auto-passed',
  fail: 'Auto-failed',
  pending: 'Pending review',
}

export function PhotoVerifReviewContent({ row, onClose }: Props) {
  const [pending, startTransition] = useTransition()
  const [showRejectModal, setShowRejectModal] = useState(false)

  function handleApprove() {
    startTransition(async () => {
      const result = await reviewPhotoVerif({ photoId: row.id, decision: 'approved' })
      if (result.error) toast.error(result.error)
      else {
        toast.success(`Photo approved for ${row.driverName}`)
        onClose()
      }
    })
  }

  function handleRejectConfirm(reason: string) {
    startTransition(async () => {
      const result = await reviewPhotoVerif({ photoId: row.id, decision: 'rejected', reason })
      if (result.error) toast.error(result.error)
      else {
        toast.success(`Photo rejected for ${row.driverName}`)
        setShowRejectModal(false)
        onClose()
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Details */}
      <section className="space-y-2">
        <p className="text-[11px] font-bold tracking-[2.5px] text-[#666666] uppercase">Details</p>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-[13px]">
          {(
            [
              ['Driver', row.driverName],
              ['Date', row.promptDate.slice(0, 10)],
              ['Disposition', row.disposition],
              ['Result', RESULT_LABEL[row.dispositionResult]],
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
      </section>

      {/* Photo */}
      <section className="space-y-2">
        <p className="text-[11px] font-bold tracking-[2.5px] text-[#666666] uppercase">Photo</p>
        <Image
          src={row.signedPhotoUrl ?? '/placeholder-photo.png'}
          alt={`Verification photo — ${row.driverName}`}
          width={400}
          height={300}
          className="w-full rounded border border-[#cbccc9] object-cover"
          unoptimized
        />
      </section>

      {/* Actions */}
      <div className="flex gap-3 border-t border-[#cbccc9] pt-2">
        <button
          disabled={pending}
          onClick={handleApprove}
          className="flex flex-1 items-center justify-center gap-2 rounded bg-green-600 px-4 py-2.5 text-[13px] font-bold text-white hover:bg-green-700 disabled:opacity-50"
          aria-label={`Approve photo for ${row.driverName}`}
        >
          <CheckCircle className="size-4" aria-hidden="true" /> Approve
        </button>
        <button
          disabled={pending}
          onClick={() => setShowRejectModal(true)}
          className="flex flex-1 items-center justify-center gap-2 rounded border border-red-300 bg-white px-4 py-2.5 text-[13px] font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"
          aria-label={`Reject photo for ${row.driverName}`}
        >
          <XCircle className="size-4" aria-hidden="true" /> Reject
        </button>
      </div>

      {showRejectModal && (
        <RejectReasonModal
          title={`Từ chối ảnh — ${row.driverName}`}
          onConfirm={handleRejectConfirm}
          onClose={() => setShowRejectModal(false)}
          pending={pending}
        />
      )}
    </div>
  )
}
