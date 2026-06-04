import { redirect } from 'next/navigation'

import { GaragePayoutSettingsForm } from '@/components/garage/garage-payout-settings-form'
import { GarageWithdrawalForm } from '@/components/garage/garage-withdrawal-form'
import { PayoutRow } from '@/components/garage/payout-row'
import { EmptyState } from '@/components/shared/empty-state'
import { KpiCard } from '@/components/shared/kpi-card'
import { PageHeader } from '@/components/shared/page-header'
import { SectionShell } from '@/components/shared/section-shell'
import { formatVnd } from '@/lib/garage/format'
import { getGaragePayoutData } from '@/lib/garage/queries-payout'

export const metadata = { title: 'Garage · Payout' }

export default async function GaragePayoutPage() {
  const data = await getGaragePayoutData()
  if (!data) redirect('/login')

  return (
    <div className="flex flex-col gap-8">
      <PageHeader kicker="MONEY" title="PAYOUT HISTORY" />

      {!data.profile.approved ? (
        <EmptyState
          kicker="pending"
          title="Waiting Approval"
          helper="Sau khi admin approve garage, bạn có thể setup payout settings và rút tiền."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <KpiCard label="Available balance" value={formatVnd(data.profile.balanceVnd)} />
            <KpiCard label="Lifetime earnings" value={formatVnd(data.lifetimeEarningsVnd)} />
            <KpiCard label="Withdrawals" value={formatVnd(data.withdrawalsTotalVnd)} />
          </div>

          <GarageWithdrawalForm
            profile={data.profile}
            minimumWithdrawalVnd={data.minimumWithdrawalVnd}
          />

          <GaragePayoutSettingsForm profile={data.profile} />

          <SectionShell title="Earnings from approved installs">
            {data.earnings.length === 0 ? (
              <p className="text-[14px] text-[#666666]">Chưa có earning từ install decal.</p>
            ) : (
              <div className="divide-y divide-[#f0f0ee]">
                {data.earnings.map((earning) => (
                  <div
                    key={earning.id}
                    className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-[14px] font-semibold text-[#1a1a1a]">
                        {earning.vehiclePlate} · {earning.campaignName}
                      </p>
                      <p className="text-[12px] text-[#666666]">
                        Approved {earning.createdAt.slice(0, 10)}
                      </p>
                    </div>
                    <p className="font-heading text-[22px] leading-none text-[#1a1a1a]">
                      {formatVnd(earning.amountVnd)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </SectionShell>

          <SectionShell title="Withdrawal history">
            <div className="flex flex-col gap-3">
              {data.withdrawals.length === 0 ? (
                <p className="text-[14px] text-[#666666]">Chưa có lịch sử rút tiền.</p>
              ) : (
                data.withdrawals.map((entry) => <PayoutRow key={entry.id} entry={entry} />)
              )}
            </div>
          </SectionShell>
        </>
      )}
    </div>
  )
}
