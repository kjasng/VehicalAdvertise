/**
 * Photo Verifications — driver daily photo prompt review.
 * Shows thumbnail + GPS delta + auto/manual disposition pill.
 * Server component with real data from getPhotoVerifications().
 */
import Image from 'next/image'

import { MapPin } from 'lucide-react'

import { EmptyState } from '@/components/shared/empty-state'
import { PageHeader } from '@/components/shared/page-header'
import { SectionShell } from '@/components/shared/section-shell'
import { getPhotoVerifications } from '@/lib/admin/queries-photos'

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

export default async function PhotoVerificationsPage() {
  const rows = await getPhotoVerifications()

  return (
    <div className="space-y-6">
      <PageHeader kicker="Operations" title="Photo Verifications" />
      <SectionShell title={`Queue (${rows.length})`}>
        {rows.length === 0 ? (
          <EmptyState
            kicker="empty"
            title="No Verifications"
            helper="No photo verifications are in the queue."
          />
        ) : (
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
                {rows.map((row, i) => (
                  <tr
                    key={row.id}
                    className={`border-b border-[#cbccc9] last:border-0 ${i % 2 === 1 ? 'bg-[#f7f8fa]' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <Image
                        src={row.signedPhotoUrl ?? '/placeholder-photo.png'}
                        alt={`Photo verification — ${row.driverName}`}
                        width={64}
                        height={64}
                        className="rounded border border-[#cbccc9] object-cover"
                        unoptimized
                      />
                    </td>
                    <td className="px-4 py-3 font-medium text-[#1a1a1a]">{row.driverName}</td>
                    <td className="px-4 py-3 text-[#666666]">{row.promptDate.slice(0, 10)}</td>
                    <td className="px-4 py-3">
                      {row.gpsDeltaM !== null ? (
                        <span
                          className={`inline-flex items-center gap-1 font-bold ${row.gpsDeltaM > 100 ? 'text-red-600' : 'text-green-600'}`}
                        >
                          <MapPin className="size-3" aria-hidden="true" />
                          {row.gpsDeltaM}m
                        </span>
                      ) : (
                        <span className="text-[#666666]">—</span>
                      )}
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
        )}
      </SectionShell>
    </div>
  )
}
