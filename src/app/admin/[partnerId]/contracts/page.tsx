import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

import { EmptyState } from '@/components/shared/empty-state'
import { PageHeader } from '@/components/shared/page-header'
import { SectionShell } from '@/components/shared/section-shell'
import { getPartnerCampaigns } from '@/lib/admin/queries-partner-balances'

export const metadata = { title: 'Admin · Partner Campaigns' }

interface PageProps {
  params: Promise<{ partnerId: string }>
}

export default async function PartnerCampaignsPage({ params }: PageProps) {
  const { partnerId } = await params
  const data = await getPartnerCampaigns(partnerId)
  if (!data) notFound()

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Partner"
        title={data.partnerName}
        cta={
          <Link
            href="/admin/partner-balances"
            className="inline-flex h-10 items-center gap-2 rounded border border-[#cbccc9] px-3 text-[12px] font-bold tracking-[1px] text-[#1a1a1a] uppercase hover:bg-[#f7f8fa]"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back
          </Link>
        }
      />

      <SectionShell title={`Campaigns (${data.campaigns.length})`}>
        {data.campaigns.length === 0 ? (
          <EmptyState
            kicker="empty"
            title="No Campaigns"
            helper="This partner has no campaigns yet."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead className="bg-[#f7f8fa]">
                <tr>
                  {['Campaign', 'Status', 'Dates', 'Budget', 'Spent'].map((heading) => (
                    <th
                      key={heading}
                      className="border-b border-[#cbccc9] px-4 py-3 text-left text-[12px] font-extrabold tracking-[1.5px] text-[#1a1a1a] uppercase"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.campaigns.map((campaign, index) => (
                  <tr
                    key={campaign.id}
                    className={`border-b border-[#cbccc9] last:border-0 ${index % 2 === 1 ? 'bg-[#f7f8fa]' : ''}`}
                  >
                    <td className="px-4 py-3 font-medium text-[#1a1a1a]">
                      <Link href={`/admin/contracts/${campaign.id}`} className="hover:underline">
                        {campaign.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-[#666666]">
                      {campaign.status.replace(/_/g, ' ')}
                    </td>
                    <td className="px-4 py-3 font-mono text-[12px] text-[#666666]">
                      {formatDateRange(campaign.startDate, campaign.endDate)}
                    </td>
                    <td className="px-4 py-3 font-mono text-[12px]">
                      {campaign.budgetVnd.toLocaleString('vi-VN')} ₫
                    </td>
                    <td className="px-4 py-3 font-mono text-[12px]">
                      {campaign.spentVnd.toLocaleString('vi-VN')} ₫
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

function formatDateRange(startDate: string, endDate: string) {
  return `${formatDate(startDate)} - ${formatDate(endDate)}`
}

function formatDate(date: string) {
  const [year, month, day] = date.split('-')
  return `${day}/${month}/${year}`
}
