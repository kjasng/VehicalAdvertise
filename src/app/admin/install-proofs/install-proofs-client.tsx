'use client'

import { useState, useTransition } from 'react'

import Image from 'next/image'

import { CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'

import { ReviewDrawer } from '@/components/admin/review-drawer'
import { EmptyState } from '@/components/shared/empty-state'
import { SectionShell } from '@/components/shared/section-shell'
import type { InstallProofPhoto, InstallProofRow } from '@/lib/admin/queries-photos'

import { reviewInstallProof } from './actions'

interface InstallProofsClientProps {
  rows: InstallProofRow[]
  garages: string[]
}

const STATUS_STYLES: Record<InstallProofRow['status'], string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-600',
}

export function InstallProofsClient({ rows, garages }: InstallProofsClientProps) {
  const [garage, setGarage] = useState('All garages')
  const [selected, setSelected] = useState<InstallProofRow | null>(null)
  const [reason, setReason] = useState('')
  const [pending, startTransition] = useTransition()
  const filtered = garage === 'All garages' ? rows : rows.filter((row) => row.garageName === garage)

  function open(row: InstallProofRow) {
    setReason('')
    setSelected(row)
  }

  function handleDecision(decision: 'approved' | 'rejected') {
    if (!selected) return
    if (decision === 'rejected' && reason.trim().length === 0) {
      toast.error('Nhập lý do reject install proof')
      return
    }

    startTransition(async () => {
      const result = await reviewInstallProof({
        contractId: selected.contractId,
        decision,
        reason: decision === 'rejected' ? reason.trim() : undefined,
      })
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success(`Install proof ${decision} for ${selected.driverName}`)
      setSelected(null)
    })
  }

  return (
    <>
      <div className="space-y-6">
        <label className="inline-flex items-center gap-2">
          <span className="text-[11px] font-bold tracking-[2.5px] text-[#666666] uppercase">
            Garage
          </span>
          <select
            value={garage}
            onChange={(event) => setGarage(event.target.value)}
            className="focus:ring-primary rounded border border-[#cbccc9] bg-white px-3 py-2 text-[13px] text-[#1a1a1a] focus:ring-2 focus:outline-none"
          >
            {['All garages', ...garages].map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>

        <SectionShell title={`Submissions (${filtered.length})`}>
          {filtered.length === 0 ? (
            <EmptyState
              kicker="empty"
              title="No Proofs"
              helper="No installation proof submissions have been sent yet."
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((row) => (
                <button
                  key={row.contractId}
                  onClick={() => open(row)}
                  className="focus-visible:ring-primary overflow-hidden rounded border border-[#cbccc9] bg-white text-left focus-visible:ring-2 focus-visible:outline-none"
                >
                  <div className="grid grid-cols-2 gap-px bg-[#cbccc9]">
                    {row.photos.map((photo) => (
                      <ProofImage key={photo.id} photo={photo} />
                    ))}
                  </div>
                  <div className="space-y-1 border-t border-[#cbccc9] p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-[13px] font-bold text-[#1a1a1a]">
                        {row.driverName}
                      </p>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${STATUS_STYLES[row.status]}`}
                      >
                        {row.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#666666]">
                      {row.garageName} · {row.photos.length}/4 photos
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </SectionShell>
      </div>

      <ReviewDrawer
        open={selected !== null}
        onOpenChange={(openState) => {
          if (!openState) setSelected(null)
        }}
        title={selected ? selected.driverName : 'Install Proof'}
      >
        {selected && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              {selected.photos.map((photo) => (
                <div key={photo.id} className="overflow-hidden rounded border border-[#cbccc9]">
                  <ProofImage photo={photo} large />
                </div>
              ))}
            </div>

            {selected.status === 'pending' ? (
              <div className="space-y-3 border-t border-[#cbccc9] pt-3">
                <textarea
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="Reject reason..."
                  className="focus:ring-primary min-h-20 w-full rounded border border-[#cbccc9] px-3 py-2 text-[13px] focus:ring-2 focus:outline-none"
                />
                <div className="flex gap-3">
                  <button
                    disabled={pending || selected.photos.length !== 4}
                    onClick={() => handleDecision('approved')}
                    className="flex flex-1 items-center justify-center gap-2 rounded bg-green-600 px-4 py-2.5 text-[13px] font-bold text-white hover:bg-green-700 focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:outline-none disabled:opacity-50"
                  >
                    <CheckCircle className="size-4" aria-hidden="true" /> Approve 4 Photos
                  </button>
                  <button
                    disabled={pending}
                    onClick={() => handleDecision('rejected')}
                    className="flex flex-1 items-center justify-center gap-2 rounded border border-red-300 bg-white px-4 py-2.5 text-[13px] font-bold text-red-600 hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none disabled:opacity-50"
                  >
                    <XCircle className="size-4" aria-hidden="true" /> Reject
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded border border-[#cbccc9] bg-[#f7f8fa] px-3 py-2 text-[12px] text-[#666666]">
                Proof submission này đã được review, không thể duyệt lại.
              </div>
            )}
          </div>
        )}
      </ReviewDrawer>
    </>
  )
}

function ProofImage({ photo, large = false }: { photo: InstallProofPhoto; large?: boolean }) {
  return (
    <div className={large ? 'relative aspect-[4/3]' : 'relative aspect-[3/2]'}>
      <Image
        src={photo.signedPhotoUrl ?? '/placeholder-install.png'}
        alt={`Install proof ${photo.angle}`}
        fill
        sizes={large ? '360px' : '220px'}
        className="object-cover"
        unoptimized
      />
      <span className="absolute top-2 left-2 rounded bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white uppercase">
        {photo.angle}
      </span>
      {large && (
        <span className="absolute right-2 bottom-2 rounded bg-white/90 px-2 py-0.5 text-[10px] font-bold text-[#1a1a1a] uppercase">
          {photo.status}
          {photo.gpsDeltaM !== null ? ` · ${photo.gpsDeltaM}m` : ''}
        </span>
      )}
    </div>
  )
}
