import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ArrowLeft } from 'lucide-react'

import { EmptyState } from '@/components/shared/empty-state'
import { PageHeader } from '@/components/shared/page-header'
import { SectionShell } from '@/components/shared/section-shell'
import { getCampaignAnalyticsById } from '@/lib/admin/queries-campaigns-analytics'
import { getAvailableDrivers, getContractsByCampaign } from '@/lib/admin/queries-contracts'

import { CampaignAssignmentsTable } from '../contracts-client'

export const metadata = { title: 'Admin · Campaign Detail' }

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-[#f0f0ee] text-[#666666]',
  submitted: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-blue-100 text-blue-700',
  awaiting_install: 'bg-orange-100 text-orange-700',
  active: 'bg-green-100 text-green-700',
  paused: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-[#f0f0ee] text-[#999]',
  rejected: 'bg-red-100 text-red-600',
  cancelled: 'bg-red-100 text-red-600',
  matched: 'bg-yellow-100 text-yellow-700',
  installed: 'bg-blue-100 text-blue-700',
  running: 'bg-green-100 text-green-700',
  terminated: 'bg-red-100 text-red-600',
  disputed: 'bg-red-100 text-red-600',
}

interface PageProps {
  params: Promise<{ campaignId: string }>
}

export default async function CampaignDetailPage({ params }: PageProps) {
  const { campaignId } = await params
  const [campaign, contracts, drivers] = await Promise.all([
    getCampaignAnalyticsById(campaignId),
    getContractsByCampaign(campaignId),
    getAvailableDrivers(),
  ])
  if (!campaign) notFound()

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Campaign"
        title={campaign.name}
        cta={
          <Link
            href="/admin/contracts"
            className="inline-flex h-10 items-center gap-2 rounded border border-[#cbccc9] px-3 text-[12px] font-bold tracking-[1px] text-[#1a1a1a] uppercase hover:bg-[#f7f8fa]"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back
          </Link>
        }
      />

      <section className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {[
          ['Partner', campaign.partnerName],
          ['Budget burn', `${campaign.burnPct}%`],
          ['Drivers', campaign.activeDrivers.toLocaleString('vi-VN')],
        ].map(([label, value]) => (
          <div key={label} className="rounded-md border border-[#cbccc9] bg-white p-4">
            <p className="text-[11px] font-bold tracking-[2px] text-[#666666] uppercase">{label}</p>
            <p className="mt-2 text-[22px] font-extrabold text-[#1a1a1a]">{value}</p>
          </div>
        ))}
      </section>

      <SectionShell
        title="Thống kê"
        action={
          <span
            className={`rounded px-2 py-0.5 text-[11px] font-bold tracking-[1px] uppercase ${
              STATUS_STYLES[campaign.status] ?? 'bg-[#f0f0ee] text-[#666666]'
            }`}
          >
            {campaign.status.replace(/_/g, ' ')}
          </span>
        }
      >
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-[12px] text-[#666666]">
              <span>{campaign.spentVnd.toLocaleString('vi-VN')} ₫ spent</span>
              <span className="font-bold text-[#1a1a1a]">
                {campaign.budgetVnd.toLocaleString('vi-VN')} ₫ budget
              </span>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-[#e8e8e6]">
              <div
                className={`h-2 rounded-full ${
                  campaign.burnPct >= 90
                    ? 'bg-red-500'
                    : campaign.burnPct >= 60
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(campaign.burnPct, 100)}%` }}
              />
            </div>
          </div>
          <dl className="grid gap-3 sm:grid-cols-4">
            {[
              ['Dates', formatDateRange(campaign.startDate, campaign.endDate)],
              ['Drivers', campaign.activeDrivers.toLocaleString('vi-VN')],
            ].map(([label, value]) => (
              <div key={label} className="rounded border border-[#cbccc9] bg-[#f7f8fa] p-3">
                <dt className="text-[10px] font-bold tracking-[1.5px] text-[#666666] uppercase">
                  {label}
                </dt>
                <dd className="mt-1 text-[13px] font-bold text-[#1a1a1a]">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </SectionShell>

      <SectionShell title={`Danh sách tài xế (${contracts.length})`}>
        {contracts.length === 0 ? (
          <EmptyState
            kicker="empty"
            title="Chưa có tài xế"
            helper="No drivers have been matched to this campaign yet."
          />
        ) : (
          <div className="overflow-x-auto">
            <CampaignAssignmentsTable contracts={contracts} drivers={drivers} />
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
