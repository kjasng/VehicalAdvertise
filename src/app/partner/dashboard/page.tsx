/**
 * Partner Dashboard — campaign performance overview.
 * 4 KPI cards + active campaigns grid + recent ledger entries.
 * All data mocked; DEMO badge shown in non-production.
 */
import { CampaignCard } from '@/components/partner/campaign-card'
import { LedgerTable } from '@/components/partner/ledger-table'
import { MOCK_CAMPAIGNS, MOCK_PARTNER_LEDGER, MOCK_WALLET } from '@/components/partner/mock-data'
import { KpiCard } from '@/components/shared/kpi-card'
import { PageHeader } from '@/components/shared/page-header'
import { SectionShell } from '@/components/shared/section-shell'

export const metadata = { title: 'Partner · Dashboard' }

const activeCampaigns = MOCK_CAMPAIGNS.filter((c) => c.status === 'active')
const totalKmThisMonth = activeCampaigns.reduce((sum, c) => sum + c.consumedKm, 0)
const spendThisMonth = activeCampaigns.reduce((sum, c) => sum + c.spentVnd, 0)

const KPI_DATA = [
  {
    label: 'Active Campaigns',
    value: String(activeCampaigns.length),
    delta: '1',
    deltaDirection: 'up' as const,
  },
  {
    label: 'Total km This Month',
    value: totalKmThisMonth.toLocaleString('vi-VN'),
    delta: '6.4',
    deltaDirection: 'up' as const,
  },
  {
    label: 'Spend This Month (₫)',
    value: `${Math.round(spendThisMonth / 1_000_000)}M`,
    delta: '3.1',
    deltaDirection: 'up' as const,
  },
  {
    label: 'Wallet Balance (₫)',
    value: `${Math.round(MOCK_WALLET.balanceVnd / 1_000_000)}M`,
  },
]

export default function PartnerDashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader kicker="Overview" title="Dashboard" />

      {/* KPI grid */}
      <section aria-label="Key metrics">
        <p className="mb-2 text-[11px] font-bold tracking-[2.5px] text-[#666666] uppercase">
          Key Metrics
        </p>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {KPI_DATA.map((kpi) => (
            <KpiCard
              key={kpi.label}
              label={kpi.label}
              value={kpi.value}
              delta={kpi.delta}
              deltaDirection={kpi.deltaDirection}
              demo
            />
          ))}
        </div>
      </section>

      {/* Active campaigns */}
      <SectionShell title="Active Campaigns">
        {activeCampaigns.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {activeCampaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        ) : (
          <p className="text-[13px] text-[#666666]">No active campaigns.</p>
        )}
      </SectionShell>

      {/* Recent ledger */}
      <SectionShell title="Recent Ledger">
        <LedgerTable rows={MOCK_PARTNER_LEDGER} limit={5} />
      </SectionShell>
    </div>
  )
}
