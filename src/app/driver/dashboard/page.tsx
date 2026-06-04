/**
 * Driver Dashboard — today's snapshot.
 * Desktop: TodayCard + WeeklyKmChart side-by-side at lg breakpoint.
 * Recent verifications section below in full width.
 * Server component. Dashboard KPIs still use mock driving data; garage-selection
 * notices use real contract/garage data.
 */
import { CheckCircle, Clock, XCircle } from 'lucide-react'
import Link from 'next/link'

import { TodayCard } from '@/components/driver/today-card'
import { WeeklyKmChart } from '@/components/driver/weekly-km-chart'
import {
  MOCK_DAILY_KM,
  MOCK_TODAY_STATS,
  MOCK_VERIFICATION_PROMPTS,
} from '@/components/driver/mock-data'
import { PageHeader } from '@/components/shared/page-header'
import { SectionShell } from '@/components/shared/section-shell'
import { getDriverGarageSelectionData } from '@/lib/driver/queries-garage-selection'

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

export default async function DriverDashboardPage() {
  const prompts = MOCK_VERIFICATION_PROMPTS.slice(0, 3)
  const garageData = await getDriverGarageSelectionData()
  const installContract = garageData?.contract ?? null

  return (
    <div className="space-y-6">
      <PageHeader kicker="TODAY" title="Dashboard" />

      {installContract && !installContract.selectedGarage && (
        <SectionShell
          title="Chọn garage lắp decal"
          action={
            <Link
              href="/driver/garage"
              className="rounded bg-[#ff5c00] px-3 py-2 text-[12px] font-bold text-white hover:bg-[#e05200]"
            >
              Chọn garage
            </Link>
          }
        >
          <p className="text-[13px] text-[#666666]">
            Bạn đã được gắn campaign {installContract.campaignName}. Chọn garage gần bạn để lắp
            decal trước khi bắt đầu earning.
          </p>
        </SectionShell>
      )}

      {installContract?.selectedGarage && installContract.status !== 'running' && (
        <SectionShell
          title="Garage đã chọn"
          action={
            <Link
              href="/driver/garage"
              className="rounded border border-[#cbccc9] px-3 py-2 text-[12px] font-bold text-[#1a1a1a] hover:bg-[#f7f8fa]"
            >
              Xem hướng dẫn
            </Link>
          }
        >
          <p className="text-[13px] text-[#666666]">
            {installContract.selectedGarage.shopName} sẽ lắp decal cho xe{' '}
            <span className="font-mono text-[#1a1a1a]">{installContract.vehiclePlate}</span>. Sau
            khi garage upload ảnh và admin approve, bạn mới bắt đầu earning.
          </p>
        </SectionShell>
      )}

      {/* Today's stats + weekly chart — side-by-side on desktop */}
      <div className="grid gap-6 lg:grid-cols-2">
        <TodayCard stats={MOCK_TODAY_STATS} />
        <WeeklyKmChart data={MOCK_DAILY_KM} />
      </div>

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
