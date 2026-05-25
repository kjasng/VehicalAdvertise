'use client'

/**
 * Install Proofs — garage installation photo review.
 * 3-column photo grid, filter by garage, click-to-review drawer.
 */
import { useState } from 'react'

import Image from 'next/image'

import { CheckCircle, XCircle, MapPin } from 'lucide-react'
import { toast } from 'sonner'

import type { InstallProofRow } from '@/components/admin/mock-data'
import { MOCK_INSTALL_PROOF_ROWS, MOCK_GARAGES } from '@/components/admin/mock-data'
import { ReviewDrawer } from '@/components/admin/review-drawer'
import { PageHeader } from '@/components/shared/page-header'
import { SectionShell } from '@/components/shared/section-shell'

export default function InstallProofsPage() {
  const [garage, setGarage] = useState('All garages')
  const [selected, setSelected] = useState<InstallProofRow | null>(null)

  const rows =
    garage === 'All garages'
      ? MOCK_INSTALL_PROOF_ROWS
      : MOCK_INSTALL_PROOF_ROWS.filter((r) => r.garage === garage)

  function handleApprove() {
    if (!selected) return
    console.log('[STUB] approve install proof', selected.id)
    toast.success(`Install proof approved for ${selected.driverName}`)
    setSelected(null)
  }

  function handleReject() {
    if (!selected) return
    console.log('[STUB] reject install proof', selected.id)
    toast.error(`Install proof rejected for ${selected.driverName}`)
    setSelected(null)
  }

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          kicker="Operations"
          title="Install Proofs"
          cta={
            <label className="flex items-center gap-2">
              <span className="text-[11px] font-bold tracking-[1.5px] text-[#666666] uppercase">
                Garage
              </span>
              <select
                value={garage}
                onChange={(e) => setGarage(e.target.value)}
                className="focus:ring-primary rounded border border-[#cbccc9] bg-white px-3 py-2 text-[13px] text-[#1a1a1a] focus:ring-2 focus:outline-none"
              >
                {MOCK_GARAGES.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </label>
          }
        />

        <SectionShell title={`Photos (${rows.length})`}>
          {rows.length === 0 ? (
            <p className="py-10 text-center text-[13px] text-[#666666]">
              No proofs for selected garage.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {rows.map((row) => (
                <button
                  key={row.id}
                  onClick={() => setSelected(row)}
                  className="group focus-visible:ring-primary relative overflow-hidden rounded border border-[#cbccc9] text-left focus-visible:ring-2 focus-visible:outline-none"
                  aria-label={`Review install proof for ${row.driverName}`}
                >
                  <Image
                    src={row.photoUrl}
                    alt={`Install proof — ${row.driverName}`}
                    width={300}
                    height={200}
                    className="h-auto w-full transition-transform duration-300 group-hover:scale-105"
                    unoptimized
                  />
                  <div className="border-t border-[#cbccc9] bg-white p-2">
                    <p className="text-[12px] font-medium text-[#1a1a1a]">{row.driverName}</p>
                    <p className="text-[11px] text-[#666666]">{row.garage}</p>
                    <div className="mt-1 flex items-center gap-1">
                      <MapPin className="size-3 text-[#666666]" aria-hidden="true" />
                      <span
                        className={`text-[11px] font-bold ${row.gpsDeltaM > 100 ? 'text-red-600' : 'text-green-600'}`}
                      >
                        {row.gpsDeltaM}m delta
                      </span>
                    </div>
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
              src={selected.photoUrl}
              alt="Install proof"
              width={400}
              height={267}
              className="h-auto w-full rounded border border-[#cbccc9]"
              unoptimized
            />
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-[13px]">
              {[
                ['Driver', selected.driverName],
                ['Garage', selected.garage],
                ['Submitted', selected.submittedAt],
                ['GPS delta', `${selected.gpsDeltaM}m`],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-[11px] font-bold tracking-[1px] text-[#666666] uppercase">
                    {label}
                  </dt>
                  <dd
                    className={`mt-0.5 ${label === 'GPS delta' && selected.gpsDeltaM > 100 ? 'font-bold text-red-600' : 'text-[#1a1a1a]'}`}
                  >
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
            {selected.gpsDeltaM > 100 && (
              <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">
                GPS delta exceeds 100m threshold — verify location manually.
              </div>
            )}
            <div className="flex gap-3 border-t border-[#cbccc9] pt-2">
              <button
                onClick={handleApprove}
                className="flex flex-1 items-center justify-center gap-2 rounded bg-green-600 px-4 py-2.5 text-[13px] font-bold text-white hover:bg-green-700 focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:outline-none"
                aria-label="Approve install proof"
              >
                <CheckCircle className="size-4" aria-hidden="true" /> Approve
              </button>
              <button
                onClick={handleReject}
                className="flex flex-1 items-center justify-center gap-2 rounded border border-red-300 bg-white px-4 py-2.5 text-[13px] font-bold text-red-600 hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none"
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
