/**
 * Garage Dashboard — today's install queue + KPI overview.
 */
import { KpiCard } from '@/components/shared/kpi-card'
import { PageHeader } from '@/components/shared/page-header'
import { InstallCard } from '@/components/garage/install-card'
import { MOCK_TODAY_ORDERS, MOCK_INSTALL_ORDERS } from '@/components/garage/mock-data'

export const metadata = { title: 'Garage · Dashboard' }

export default function GarageDashboardPage() {
  const todayScheduled = MOCK_TODAY_ORDERS.length
  const inProgress = MOCK_INSTALL_ORDERS.filter(
    (o) => o.status === 'awaiting_install' || o.status === 'matched',
  ).length
  const awaitingPayout = MOCK_INSTALL_ORDERS.filter((o) => o.status === 'installed').length

  return (
    <div className="flex flex-col gap-8">
      <PageHeader kicker="OVERVIEW" title="DASHBOARD" />

      {/* KPI row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="Hôm nay lên lịch" value={todayScheduled} demo />
        <KpiCard label="Đang thực hiện" value={inProgress} demo />
        <KpiCard label="Chờ thanh toán" value={awaitingPayout} demo />
      </div>

      {/* Today's appointments */}
      <section aria-labelledby="today-heading">
        <h2
          id="today-heading"
          className="mb-4 text-[12px] font-extrabold tracking-[1.5px] text-[#666666] uppercase"
        >
          Lịch hôm nay
        </h2>

        {MOCK_TODAY_ORDERS.length === 0 ? (
          <p className="text-[14px] text-[#666666]">Không có lịch lắp đặt nào hôm nay.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {MOCK_TODAY_ORDERS.map((order) => (
              <InstallCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
