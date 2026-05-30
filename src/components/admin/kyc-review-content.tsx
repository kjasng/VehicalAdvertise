'use client'

/**
 * KycReviewContent — drawer body for a KYC review.
 * Accepts KycQueueRow (real data with server-signed photo URLs).
 */
import Image from 'next/image'

import { CheckCircle, XCircle } from 'lucide-react'
import { useTransition } from 'react'
import { toast } from 'sonner'

import { reviewDriverKyc } from '@/app/admin/drivers-kyc/actions'
import type { KycQueueRow } from '@/lib/admin/queries-kyc'

interface KycReviewContentProps {
  row: KycQueueRow
  onClose: () => void
}

const PLACEHOLDER = '/placeholder-id.png'

export function KycReviewContent({ row, onClose }: KycReviewContentProps) {
  const [pending, startTransition] = useTransition()

  function handleDecision(decision: 'approved' | 'rejected') {
    startTransition(async () => {
      const result = await reviewDriverKyc({ driverId: row.id, decision })
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`KYC ${decision} for ${row.fullName}`)
        onClose()
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Profile fields */}
      <section className="space-y-2">
        <p className="text-[11px] font-bold tracking-[2.5px] text-[#666666] uppercase">Profile</p>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-[13px]">
          {[
            ['Name', row.fullName],
            ['Phone', row.phone ?? '—'],
            ['District', row.district ?? '—'],
            ['Submitted', row.submittedAt],
            ['Status', row.kycStatus],
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

      {/* CCCD photos */}
      <section className="space-y-2">
        <p className="text-[11px] font-bold tracking-[2.5px] text-[#666666] uppercase">
          CCCD Photos
        </p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Front', src: row.signedFront },
            { label: 'Back', src: row.signedBack },
          ].map(({ label, src }) => (
            <div key={label} className="space-y-1">
              <p className="text-[11px] text-[#666666]">{label}</p>
              <Image
                src={src ?? PLACEHOLDER}
                alt={`CCCD ${label.toLowerCase()}`}
                width={320}
                height={200}
                className="h-auto w-full rounded border border-[#cbccc9]"
                unoptimized
              />
            </div>
          ))}
        </div>
      </section>

      {/* Selfie */}
      <section className="space-y-2">
        <p className="text-[11px] font-bold tracking-[2.5px] text-[#666666] uppercase">Selfie</p>
        <Image
          src={row.signedSelfie ?? PLACEHOLDER}
          alt="Selfie"
          width={200}
          height={200}
          className="rounded border border-[#cbccc9]"
          unoptimized
        />
      </section>

      {/* Actions */}
      <div className="flex gap-3 border-t border-[#cbccc9] pt-2">
        <button
          disabled={pending}
          onClick={() => handleDecision('approved')}
          className="flex flex-1 items-center justify-center gap-2 rounded bg-green-600 px-4 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-green-700 focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:outline-none disabled:opacity-50"
          aria-label={`Approve KYC for ${row.fullName}`}
        >
          <CheckCircle className="size-4" aria-hidden="true" />
          Approve
        </button>
        <button
          disabled={pending}
          onClick={() => handleDecision('rejected')}
          className="flex flex-1 items-center justify-center gap-2 rounded border border-red-300 bg-white px-4 py-2.5 text-[13px] font-bold text-red-600 transition-colors hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none disabled:opacity-50"
          aria-label={`Reject KYC for ${row.fullName}`}
        >
          <XCircle className="size-4" aria-hidden="true" />
          Reject
        </button>
      </div>
    </div>
  )
}
