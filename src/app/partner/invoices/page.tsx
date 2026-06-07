import { redirect } from 'next/navigation'

import { PartnerInvoiceBreakdownTable } from '@/components/partner/partner-invoice-breakdown-table'
import { EmptyState } from '@/components/shared/empty-state'
import { PageHeader } from '@/components/shared/page-header'
import { SectionShell } from '@/components/shared/section-shell'
import { formatVnd } from '@/lib/partner/constants'
import { getPartnerCampaignInvoices } from '@/lib/partner/queries-invoices'

export const metadata = { title: 'Partner · Invoices' }

export default async function PartnerInvoicesPage() {
  const data = await getPartnerCampaignInvoices()
  if (!data) redirect('/login')

  return (
    <div className="space-y-6">
      <PageHeader kicker="Plan" title="Invoices" />

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Campaign budget" value={formatVnd(data.totals.budgetVnd)} />
        <Kpi label="Paid to drivers" value={formatVnd(data.totals.driverPaidVnd)} />
        <Kpi label="Paid to garages" value={formatVnd(data.totals.garagePaidVnd)} />
        <Kpi label="Remaining after fee" value={formatVnd(data.totals.remainingVnd)} />
      </section>

      <SectionShell title="Campaign invoice breakdown">
        {data.rows.length === 0 ? (
          <EmptyState
            kicker="empty"
            title="No Invoices"
            helper="Campaign financial breakdown will appear after you create campaigns."
          />
        ) : (
          <PartnerInvoiceBreakdownTable rows={data.rows} />
        )}
      </SectionShell>
    </div>
  )
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-[#cbccc9] bg-white p-4">
      <p className="text-[11px] font-bold tracking-[2px] text-[#666666] uppercase">{label}</p>
      <p className="mt-2 font-mono text-[18px] font-extrabold text-[#1a1a1a]">{value}</p>
    </div>
  )
}
