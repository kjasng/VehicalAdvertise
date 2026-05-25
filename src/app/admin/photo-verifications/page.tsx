/**
 * Photo Verifications — driver daily photo prompt review queue.
 * Shows thumbnail + GPS delta + auto/manual disposition pill.
 * Server component — no drawer needed (disposition shown inline).
 */
import Image from 'next/image'

import { MapPin } from 'lucide-react'

import { MOCK_PHOTO_VERIFICATION_ROWS } from '@/components/admin/mock-data'
import { PageHeader } from '@/components/shared/page-header'
import { SectionShell } from '@/components/shared/section-shell'

const DISPOSITION_STYLES = {
  auto: 'bg-blue-100 text-blue-700',
  manual: 'bg-yellow-100 text-yellow-700',
}

const RESULT_STYLES = {
  pass: 'bg-green-100 text-green-700',
  fail: 'bg-red-100 text-red-600',
  pending: 'bg-yellow-100 text-yellow-700',
}

export const metadata = { title: 'Admin · Photo Verifications' }

export default function PhotoVerificationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader kicker="Operations" title="Photo Verifications" />
      <SectionShell title={`Queue (${MOCK_PHOTO_VERIFICATION_ROWS.length})`}>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="bg-[#f7f8fa]">
              <tr>
                {['Photo', 'Driver', 'Date', 'GPS Delta', 'Disposition', 'Result'].map((h) => (
                  <th
                    key={h}
                    className="border-b border-[#cbccc9] px-4 py-3 text-left text-[12px] font-extrabold tracking-[1.5px] text-[#1a1a1a] uppercase"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_PHOTO_VERIFICATION_ROWS.map((row, i) => (
                <tr
                  key={row.id}
                  className={`border-b border-[#cbccc9] last:border-0 ${i % 2 === 1 ? 'bg-[#f7f8fa]' : ''}`}
                >
                  <td className="px-4 py-3">
                    <Image
                      src={row.photoUrl}
                      alt={`Photo verification — ${row.driverName}`}
                      width={64}
                      height={64}
                      className="rounded border border-[#cbccc9] object-cover"
                      unoptimized
                    />
                  </td>
                  <td className="px-4 py-3 font-medium text-[#1a1a1a]">{row.driverName}</td>
                  <td className="px-4 py-3 text-[#666666]">{row.promptDate}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 font-bold ${row.gpsDeltaM > 100 ? 'text-red-600' : 'text-green-600'}`}
                    >
                      <MapPin className="size-3" aria-hidden="true" />
                      {row.gpsDeltaM}m
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-[11px] font-bold tracking-[1px] uppercase ${DISPOSITION_STYLES[row.disposition]}`}
                    >
                      {row.disposition}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-[11px] font-bold tracking-[1px] uppercase ${RESULT_STYLES[row.dispositionResult]}`}
                    >
                      {row.dispositionResult}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionShell>
    </div>
  )
}
