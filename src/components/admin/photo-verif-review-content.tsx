'use client'

import Image from 'next/image'
import { useState, useTransition } from 'react'

import { CheckCircle, MapPin, XCircle } from 'lucide-react'
import { toast } from 'sonner'

import { reviewPhotoVerif } from '@/app/admin/photo-verifications/actions'
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
  const [rejecting, setRejecting] = useState(false)
  const [reason, setReason] = useState('')

  function handleApprove() {
    startTransition(async () => {
      const result = await reviewPhotoVerif({ photoId: row.id, decision: 'approved' })
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`Photo approved for ${row.driverName}`)
        onClose()
      }
    })
  }

  function handleReject() {
    if (!rejecting) {
      setRejecting(true)
      return
    }
    if (!reason.trim()) {
      toast.error('Rejection reason is required')
      return
    }
    startTransition(async () => {
      const result = await reviewPhotoVerif({ photoId: row.id, decision: 'rejected', reason })
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`Photo rejected for ${row.driverName}`)
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
        {row.gpsDeltaM !== null && (
          <p
            className={`flex items-center gap-1 text-[13px] font-medium ${row.gpsDeltaM > 100 ? 'text-red-600' : 'text-green-600'}`}
          >
            <MapPin className="size-3.5" aria-hidden="true" />
            GPS delta: {row.gpsDeltaM}m {row.gpsDeltaM > 100 ? '(out of range)' : '(within 100m)'}
          </p>
        )}
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

      {/* Reject reason — shown after first "Reject" click */}
      {rejecting && (
        <section className="space-y-2">
          <label
            htmlFor="reject-reason"
            className="text-[11px] font-bold tracking-[2.5px] text-[#666666] uppercase"
          >
            Reject reason *
          </label>
          <textarea
            id="reject-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className="focus:ring-primary w-full rounded border border-[#cbccc9] px-3 py-2 text-[13px] text-[#1a1a1a] focus:ring-2 focus:outline-none"
            placeholder="Describe why this photo is being rejected…"
          />
        </section>
      )}

      {/* Actions */}
      <div className="flex gap-3 border-t border-[#cbccc9] pt-2">
        <button
          disabled={pending}
          onClick={handleApprove}
          className="flex flex-1 items-center justify-center gap-2 rounded bg-green-600 px-4 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-green-700 focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:outline-none disabled:opacity-50"
          aria-label={`Approve photo for ${row.driverName}`}
        >
          <CheckCircle className="size-4" aria-hidden="true" />
          Approve
        </button>
        <button
          disabled={pending}
          onClick={handleReject}
          className="flex flex-1 items-center justify-center gap-2 rounded border border-red-300 bg-white px-4 py-2.5 text-[13px] font-bold text-red-600 transition-colors hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none disabled:opacity-50"
          aria-label={`Reject photo for ${row.driverName}`}
        >
          <XCircle className="size-4" aria-hidden="true" />
          {rejecting ? 'Confirm Reject' : 'Reject'}
        </button>
      </div>
    </div>
  )
}
