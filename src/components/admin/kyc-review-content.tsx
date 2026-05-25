'use client'

/**
 * KycReviewContent — drawer body for a KYC review.
 * Approve / reject stub server actions (console.log + toast).
 */
import Image from 'next/image'

import { CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'

import type { KycRow } from './mock-data'

interface KycReviewContentProps {
  row: KycRow
  onClose: () => void
}

export function KycReviewContent({ row, onClose }: KycReviewContentProps) {
  function handleApprove() {
    console.log('[STUB] approve KYC', row.id)
    toast.success(`KYC approved for ${row.name}`)
    onClose()
  }

  function handleReject() {
    console.log('[STUB] reject KYC', row.id)
    toast.error(`KYC rejected for ${row.name}`)
    onClose()
  }

  return (
    <div className="space-y-6">
      {/* Profile fields */}
      <section className="space-y-2">
        <p className="text-[11px] font-bold tracking-[1.5px] text-[#666666] uppercase">Profile</p>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-[13px]">
          {[
            ['Name', row.name],
            ['Phone', row.phone],
            ['CCCD No.', row.cccdNumber],
            ['District', row.district],
            ['Submitted', row.submittedAt],
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
        <p className="text-[11px] font-bold tracking-[1.5px] text-[#666666] uppercase">
          CCCD Photos
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <p className="text-[11px] text-[#666666]">Front</p>
            <Image
              src={row.cccdFrontUrl}
              alt="CCCD front"
              width={320}
              height={200}
              className="h-auto w-full rounded border border-[#cbccc9]"
              unoptimized
            />
          </div>
          <div className="space-y-1">
            <p className="text-[11px] text-[#666666]">Back</p>
            <Image
              src={row.cccdBackUrl}
              alt="CCCD back"
              width={320}
              height={200}
              className="h-auto w-full rounded border border-[#cbccc9]"
              unoptimized
            />
          </div>
        </div>
      </section>

      {/* Selfie */}
      <section className="space-y-2">
        <p className="text-[11px] font-bold tracking-[1.5px] text-[#666666] uppercase">Selfie</p>
        <Image
          src={row.selfieUrl}
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
          onClick={handleApprove}
          className="flex flex-1 items-center justify-center gap-2 rounded bg-green-600 px-4 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-green-700 focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:outline-none"
          aria-label={`Approve KYC for ${row.name}`}
        >
          <CheckCircle className="size-4" aria-hidden="true" />
          Approve
        </button>
        <button
          onClick={handleReject}
          className="flex flex-1 items-center justify-center gap-2 rounded border border-red-300 bg-white px-4 py-2.5 text-[13px] font-bold text-red-600 transition-colors hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none"
          aria-label={`Reject KYC for ${row.name}`}
        >
          <XCircle className="size-4" aria-hidden="true" />
          Reject
        </button>
      </div>
    </div>
  )
}
