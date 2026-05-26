/**
 * Driver Dashboard — today's snapshot.
 * TodayCard (km + earnings + campaign + photo CTA) + weekly km area chart
 * + last 3 verification prompt rows.
 * Server component — all data from mock-data.ts.
 */
import { CheckCircle, Clock, XCircle } from 'lucide-react'

import { TodayCard } from '@/components/driver/today-card'
import { WeeklyKmChart } from '@/components/driver/weekly-km-chart'
import {
  MOCK_DAILY_KM,
  MOCK_TODAY_STATS,
  MOCK_VERIFICATION_PROMPTS,
} from '@/components/driver/mock-data'
import { PageHeader } from '@/components/shared/page-header'
import { SectionShell } from '@/components/shared/section-shell'

export const metadata = { title: 'Driver · Dashboard' }

const STATUS_ICON = {
  passed: <CheckCircle className="size-4 text-green-500" aria-hidden="true" />,
  failed: <XCircle className="size-4 text-red-500" aria-hidden="true" />,
  pending: <Clock className="size-4 text-yellow-500" aria-hidden="true" />,
} as const

const STATUS_LABEL = {
  passed: 'Passed',
  failed: 'Failed',
  pending: 'Pending',
} as const

export default function DriverDashboardPage() {
  const prompts = MOCK_VERIFICATION_PROMPTS.slice(0, 3)

  return (
    <div className="mx-auto max-w-[480px] space-y-6">
      <PageHeader kicker="TODAY" title="Dashboard" />

      {/* Today's stats + CTA */}
      <TodayCard stats={MOCK_TODAY_STATS} />

      {/* Weekly km chart */}
      <WeeklyKmChart data={MOCK_DAILY_KM} />

      {/* Recent verification prompts */}
      <SectionShell title="Recent Verifications">
        {prompts.length === 0 ? (
          <p className="text-[13px] text-[#666666]">No verification prompts yet.</p>
        ) : (
          <ul className="divide-y divide-[#f0f0ee]" aria-label="Recent verification prompts">
            {prompts.map((p) => (
              <li key={p.id} className="flex items-center gap-3 py-3">
                {STATUS_ICON[p.status]}
                <span className="flex-1 text-[13px] text-[#1a1a1a]">{p.promptedAt}</span>
                <span
                  className="text-[11px] font-bold tracking-[1px] text-[#666666] uppercase"
                  aria-label={`Status: ${STATUS_LABEL[p.status]}`}
                >
                  {STATUS_LABEL[p.status]}
                </span>
              </li>
            ))}
          </ul>
        )}
      </SectionShell>
    </div>
  )
}
