import { redirect } from 'next/navigation'

import { CampaignCard } from '@/components/partner/campaign-card'
import { LedgerTable } from '@/components/partner/ledger-table'
import { KpiCard } from '@/components/shared/kpi-card'
import { PageHeader } from '@/components/shared/page-header'
import { SectionShell } from '@/components/shared/section-shell'
import { formatVnd } from '@/lib/partner/constants'
import { getPartnerData } from '@/lib/partner/queries'

import { PartnerWelcomeModal } from './partner-welcome-modal'

export const metadata = { title: 'Partner · Dashboard' }

export default async function PartnerDashboardPage() {
  const data = await getPartnerData()
  if (!data) redirect('/login')

  const activeCampaigns = data.campaigns.filter((campaign) => campaign.status === 'active')
  const monthlyCapTotal = data.campaigns.reduce((sum, campaign) => sum + campaign.monthlyCapVnd, 0)
  const monthlySpent = data.campaigns.reduce((sum, campaign) => sum + campaign.spentVnd, 0)
  const totalDrivers = data.campaigns.reduce(
    (sum, campaign) => sum + campaign.requestedDriverCount,
    0,
  )

  return (
    <div className="space-y-8">
      <PartnerWelcomeModal partnerId={data.partnerId} />
      <PageHeader kicker="Overview" title="Dashboard" />

      <section aria-label="Key metrics">
        <p className="mb-2 text-[11px] font-bold tracking-[2.5px] text-[#666666] uppercase">
          Key Metrics
        </p>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard label="Current Balance" value={formatCompact(data.balanceVnd)} />
          <KpiCard label="Total Campaigns" value={data.campaigns.length} />
          <KpiCard label="Active Campaigns" value={activeCampaigns.length} />
          <KpiCard label="Total Drivers" value={totalDrivers} />
        </div>
      </section>

      <SectionShell title="Monthly Budget Usage">
        <div className="space-y-2">
          <div className="flex justify-between text-[12px] font-bold tracking-[1px] text-[#666666] uppercase">
            <span>{formatVnd(monthlySpent)}</span>
            <span>{formatVnd(monthlyCapTotal)}</span>
          </div>
          <div className="h-2 rounded-full bg-[#f0f0ee]">
            <div
              className="h-2 rounded-full bg-[#ff5c00]"
              style={{
                width: `${monthlyCapTotal > 0 ? Math.min(100, Math.round((monthlySpent / monthlyCapTotal) * 100)) : 0}%`,
              }}
            />
          </div>
        </div>
      </SectionShell>

      <SectionShell title="Campaign List">
        {data.campaigns.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {data.campaigns.slice(0, 4).map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        ) : (
          <p className="text-[13px] text-[#666666]">No campaigns yet.</p>
        )}
      </SectionShell>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionShell title="Notifications">
          {data.notifications.length > 0 ? (
            <ul className="space-y-3">
              {data.notifications.map((notification) => (
                <li key={notification.id} className="rounded border border-[#cbccc9] p-3">
                  <p className="text-[13px] font-bold text-[#1a1a1a]">{notification.title}</p>
                  <p className="mt-1 text-[12px] text-[#666666]">{notification.body}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[13px] text-[#666666]">No notifications yet.</p>
          )}
        </SectionShell>

        <SectionShell title="Support Center">
          <div className="space-y-2 text-[13px] text-[#666666]">
            <p>
              <strong className="text-[#1a1a1a]">Hotline:</strong> 1900 xxxx
            </p>
            <p>
              <strong className="text-[#1a1a1a]">Email:</strong> support@vehicaladvertise.com
            </p>
            <p>FAQ: Billing, campaign approval, creative specs, and driver matching.</p>
          </div>
        </SectionShell>
      </div>

      <SectionShell title="Recent Ledger">
        <LedgerTable rows={data.ledger} limit={5} />
      </SectionShell>
    </div>
  )
}

function formatCompact(amount: number) {
  if (amount >= 1_000_000) return `${Math.round(amount / 1_000_000)}M`
  return amount.toLocaleString('vi-VN')
}
