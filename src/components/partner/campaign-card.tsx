/**
 * CampaignCard — partner-eye view of a single campaign.
 * Shows status pill, km progress bar, budget spend.
 */
import { cn } from '@/lib/utils'

import type { CampaignRow, CampaignStatus } from './mock-data'

const STATUS_STYLES: Record<CampaignStatus, string> = {
  draft: 'bg-[#f0f0ee] text-[#666666]',
  submitted: 'bg-blue-100 text-blue-700',
  approved: 'bg-yellow-100 text-yellow-700',
  active: 'bg-green-100 text-green-700',
  paused: 'bg-red-100 text-red-600',
}

const STATUS_LABEL: Record<CampaignStatus, string> = {
  draft: 'DRAFT',
  submitted: 'SUBMITTED',
  approved: 'APPROVED',
  active: 'ACTIVE',
  paused: 'PAUSED',
}

interface CampaignCardProps {
  campaign: CampaignRow
}

function fmt(n: number) {
  return n.toLocaleString('vi-VN')
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const progressPct =
    campaign.targetKm > 0
      ? Math.min(100, Math.round((campaign.consumedKm / campaign.targetKm) * 100))
      : 0

  const budgetPct =
    campaign.budgetVnd > 0
      ? Math.min(100, Math.round((campaign.spentVnd / campaign.budgetVnd) * 100))
      : 0

  return (
    <article
      className="flex flex-col gap-4 rounded-md border border-[#cbccc9] bg-white p-5"
      aria-label={`Campaign: ${campaign.name}`}
    >
      {/* Title + status pill */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-heading text-[20px] leading-none text-[#1a1a1a] uppercase">
          {campaign.name}
        </h3>
        <span
          className={cn(
            'shrink-0 rounded px-2 py-0.5 text-[11px] font-bold tracking-[1px] uppercase',
            STATUS_STYLES[campaign.status],
          )}
        >
          {STATUS_LABEL[campaign.status]}
        </span>
      </div>

      {/* Districts */}
      {campaign.districts.length > 0 && (
        <p className="text-[12px] text-[#666666]">{campaign.districts.join(' · ')}</p>
      )}

      {/* KM progress */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[11px] font-bold tracking-[1.5px] text-[#666666] uppercase">
          <span>Km consumed</span>
          <span>
            {fmt(campaign.consumedKm)} / {fmt(campaign.targetKm)} km
          </span>
        </div>
        <div
          className="h-2 w-full overflow-hidden rounded-full bg-[#f0f0ee]"
          role="progressbar"
          aria-valuenow={progressPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Km progress: ${progressPct}%`}
        >
          <div
            className="h-full bg-[#ff5c00] transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Budget spend */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[11px] font-bold tracking-[1.5px] text-[#666666] uppercase">
          <span>Budget spent</span>
          <span>
            {fmt(campaign.spentVnd)} / {fmt(campaign.budgetVnd)} ₫
          </span>
        </div>
        <div
          className="h-2 w-full overflow-hidden rounded-full bg-[#f0f0ee]"
          role="progressbar"
          aria-valuenow={budgetPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Budget progress: ${budgetPct}%`}
        >
          <div
            className={cn(
              'h-full transition-all duration-300',
              budgetPct > 90 ? 'bg-red-500' : 'bg-[#1a1a1a]',
            )}
            style={{ width: `${budgetPct}%` }}
          />
        </div>
      </div>

      {/* Dates */}
      {campaign.startDate && (
        <p className="text-[12px] text-[#666666]">
          {campaign.startDate} → {campaign.endDate}
        </p>
      )}
    </article>
  )
}
