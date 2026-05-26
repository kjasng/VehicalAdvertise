/**
 * Garage Payout — weekly payout history with summary card.
 */
import { KpiCard } from '@/components/shared/kpi-card'
import { PageHeader } from '@/components/shared/page-header'
import { SectionShell } from '@/components/shared/section-shell'
import { PayoutRow } from '@/components/garage/payout-row'
import {
  MOCK_PAYOUT_ENTRIES,
  LIFETIME_EARNINGS_VND,
  PENDING_EARNINGS_VND,
} from '@/components/garage/mock-data'

export const metadata = { title: 'Garage · Payout' }

function formatVnd(amount: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

export default function GaragePayoutPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader kicker="MONEY" title="PAYOUT HISTORY" />

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <KpiCard label="Tổng thu nhập" value={formatVnd(LIFETIME_EARNINGS_VND)} demo />
        <KpiCard label="Đang chờ thanh toán" value={formatVnd(PENDING_EARNINGS_VND)} demo />
      </div>

      {/* Payout list */}
      <SectionShell title="Lịch sử thanh toán">
        <div className="flex flex-col gap-3">
          {MOCK_PAYOUT_ENTRIES.length === 0 ? (
            <p className="text-[14px] text-[#666666]">Chưa có lịch sử thanh toán.</p>
          ) : (
            MOCK_PAYOUT_ENTRIES.map((entry) => <PayoutRow key={entry.id} entry={entry} />)
          )}
        </div>
      </SectionShell>
    </div>
  )
}
