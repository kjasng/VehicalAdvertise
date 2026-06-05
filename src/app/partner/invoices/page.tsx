import { redirect } from 'next/navigation'

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
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead className="bg-[#f7f8fa]">
                <tr>
                  {['Campaign', 'Plan', 'Budget', 'Driver', 'Garage', 'Platform', 'Remaining'].map(
                    (heading) => (
                      <th
                        key={heading}
                        className="border-b border-[#cbccc9] px-4 py-3 text-left text-[11px] font-extrabold tracking-[1.5px] whitespace-nowrap text-[#1a1a1a] uppercase"
                      >
                        {heading}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {data.rows.map((row, index) => (
                  <tr
                    key={row.id}
                    className={`border-b border-[#cbccc9] last:border-0 ${index % 2 === 1 ? 'bg-[#f7f8fa]' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <p className="font-bold text-[#1a1a1a]">{row.name}</p>
                      <p className="text-[11px] text-[#666666]">
                        {row.status.replace(/_/g, ' ')} · {row.driverCount} drivers
                      </p>
                    </td>
                    <td className="px-4 py-3 text-[#666666]">{row.packageLabel}</td>
                    <MoneyCell value={row.budgetVnd} />
                    <MoneyCell
                      value={row.driverPaidVnd}
                      muted={row.driverPaidVnd === 0}
                      hint={`est. ${formatVnd(row.estimatedDriverVnd)}`}
                    />
                    <MoneyCell
                      value={row.garagePaidVnd}
                      muted={row.garagePaidVnd === 0}
                      hint={`est. ${formatVnd(row.estimatedGarageVnd)}`}
                    />
                    <MoneyCell
                      value={row.platformFeeVnd}
                      muted={row.platformFeeVnd === 0}
                      hint={`est. ${formatVnd(row.estimatedPlatformFeeVnd)}`}
                    />
                    <MoneyCell value={row.remainingVnd} danger={row.remainingVnd < 0} />
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

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-[#cbccc9] bg-white p-4">
      <p className="text-[11px] font-bold tracking-[2px] text-[#666666] uppercase">{label}</p>
      <p className="mt-2 font-mono text-[18px] font-extrabold text-[#1a1a1a]">{value}</p>
    </div>
  )
}

function MoneyCell({
  value,
  muted = false,
  danger = false,
  hint,
}: {
  value: number
  muted?: boolean
  danger?: boolean
  hint?: string
}) {
  return (
    <td
      className={`px-4 py-3 font-mono text-[12px] whitespace-nowrap ${
        danger ? 'font-bold text-red-600' : muted ? 'text-[#999]' : 'text-[#1a1a1a]'
      }`}
    >
      <span>{formatVnd(value)}</span>
      {hint && <span className="mt-1 block font-sans text-[11px] text-[#666666]">{hint}</span>}
    </td>
  )
}
