'use client'

import { useState, useTransition } from 'react'

import Image from 'next/image'

import { CheckCircle, MapPin, XCircle } from 'lucide-react'
import { toast } from 'sonner'

import { ReviewDrawer } from '@/components/admin/review-drawer'
import { EmptyState } from '@/components/shared/empty-state'
import { SectionShell } from '@/components/shared/section-shell'
import type { InstallProofRow } from '@/lib/admin/queries-photos'

import { reviewInstallProof } from './actions'

interface InstallProofsClientProps {
  rows: InstallProofRow[]
  garages: string[]
}

export function InstallProofsClient({ rows, garages }: InstallProofsClientProps) {
  const [garage, setGarage] = useState('All garages')
  const [selected, setSelected] = useState<InstallProofRow | null>(null)
  const [pending, startTransition] = useTransition()

  const filtered = garage === 'All garages' ? rows : rows.filter((r) => r.garageName === garage)

  function handleDecision(decision: 'approved' | 'rejected') {
    if (!selected) return
    startTransition(async () => {
      const result = await reviewInstallProof({ photoId: selected.id, decision })
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`Install proof ${decision} for ${selected.driverName}`)
        setSelected(null)
      }
    })
  }

  const garageOptions = ['All garages', ...garages]

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2">
            <span className="text-[11px] font-bold tracking-[2.5px] text-[#666666] uppercase">
              Garage
            </span>
            <select
              value={garage}
              onChange={(e) => setGarage(e.target.value)}
              className="focus:ring-primary rounded border border-[#cbccc9] bg-white px-3 py-2 text-[13px] text-[#1a1a1a] focus:ring-2 focus:outline-none"
            >
              {garageOptions.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </label>
        </div>

        <SectionShell title={`Photos (${filtered.length})`}>
          {filtered.length === 0 ? (
            <EmptyState
              kicker="empty"
              title="No Proofs"
              helper="No installation proofs have been submitted yet."
            />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {filtered.map((row) => (
                <button
                  key={row.id}
                  onClick={() => setSelected(row)}
                  className="group focus-visible:ring-primary relative overflow-hidden rounded border border-[#cbccc9] text-left focus-visible:ring-2 focus-visible:outline-none"
                  aria-label={`Review install proof for ${row.driverName}`}
                >
                  <Image
                    src={row.signedPhotoUrl ?? '/placeholder-install.png'}
                    alt={`Install proof — ${row.driverName}`}
                    width={300}
                    height={200}
                    className="h-auto w-full transition-transform duration-300 group-hover:scale-105"
                    unoptimized
                  />
                  <div className="border-t border-[#cbccc9] bg-white p-2">
                    <p className="text-[12px] font-medium text-[#1a1a1a]">{row.driverName}</p>
                    <p className="text-[11px] text-[#666666]">{row.garageName}</p>
                    {row.gpsDeltaM !== null && (
                      <div className="mt-1 flex items-center gap-1">
                        <MapPin className="size-3 text-[#666666]" aria-hidden="true" />
                        <span
                          className={`text-[11px] font-bold ${row.gpsDeltaM > 100 ? 'text-red-600' : 'text-green-600'}`}
                        >
                          {row.gpsDeltaM}m delta
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </SectionShell>
      </div>

      <ReviewDrawer
        open={selected !== null}
        onOpenChange={(o) => {
          if (!o) setSelected(null)
        }}
        title="Install Proof"
      >
        {selected && (
          <div className="space-y-6">
            <Image
              src={selected.signedPhotoUrl ?? '/placeholder-install.png'}
              alt="Install proof"
              width={400}
              height={267}
              className="h-auto w-full rounded border border-[#cbccc9]"
              unoptimized
            />
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-[13px]">
              {[
                ['Driver', selected.driverName],
                ['Garage', selected.garageName],
                ['Submitted', selected.submittedAt],
                ['GPS delta', selected.gpsDeltaM !== null ? `${selected.gpsDeltaM}m` : '—'],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-[11px] font-bold tracking-[1px] text-[#666666] uppercase">
                    {label}
                  </dt>
                  <dd
                    className={`mt-0.5 ${label === 'GPS delta' && selected.gpsDeltaM !== null && selected.gpsDeltaM > 100 ? 'font-bold text-red-600' : 'text-[#1a1a1a]'}`}
                  >
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
            {selected.gpsDeltaM !== null && selected.gpsDeltaM > 100 && (
              <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">
                GPS delta exceeds 100m threshold — verify location manually.
              </div>
            )}
            <div className="flex gap-3 border-t border-[#cbccc9] pt-2">
              <button
                disabled={pending}
                onClick={() => handleDecision('approved')}
                className="flex flex-1 items-center justify-center gap-2 rounded bg-green-600 px-4 py-2.5 text-[13px] font-bold text-white hover:bg-green-700 focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:outline-none disabled:opacity-50"
                aria-label="Approve install proof"
              >
                <CheckCircle className="size-4" aria-hidden="true" /> Approve
              </button>
              <button
                disabled={pending}
                onClick={() => handleDecision('rejected')}
                className="flex flex-1 items-center justify-center gap-2 rounded border border-red-300 bg-white px-4 py-2.5 text-[13px] font-bold text-red-600 hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none disabled:opacity-50"
                aria-label="Reject install proof"
              >
                <XCircle className="size-4" aria-hidden="true" /> Reject
              </button>
            </div>
          </div>
        )}
      </ReviewDrawer>
    </>
  )
}
