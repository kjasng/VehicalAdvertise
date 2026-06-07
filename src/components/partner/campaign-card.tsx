/**
 * CampaignCard — partner-eye view of a single campaign.
 * Shows status pill, km progress bar, budget spend.
 */
import { cn } from '@/lib/utils'
import type { PartnerCampaignRow } from '@/lib/partner/queries'

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-[#f0f0ee] text-[#666666]',
  submitted: 'bg-blue-100 text-blue-700',
  approved: 'bg-yellow-100 text-yellow-700',
  rejected: 'bg-red-100 text-red-600',
  awaiting_install: 'bg-orange-100 text-orange-700',
  active: 'bg-green-100 text-green-700',
  paused: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-[#f0f0ee] text-[#666666]',
  cancelled: 'bg-red-100 text-red-600',
}

const STATUS_LABEL: Record<string, string> = {
  draft: 'DRAFT',
  submitted: 'PUBLISHED / WAITING REVIEW',
  approved: 'APPROVED / READY',
  rejected: 'REJECTED',
  awaiting_install: 'WAITING INSTALL',
  active: 'RUNNING',
  paused: 'PAUSED',
  completed: 'COMPLETED',
  cancelled: 'CANCELLED',
}

interface CampaignCardProps {
  campaign: PartnerCampaignRow
}

function fmt(n: number) {
  return n.toLocaleString('vi-VN')
}

export function CampaignCard({ campaign }: CampaignCardProps) {
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
            STATUS_STYLES[campaign.status] ?? 'bg-[#f0f0ee] text-[#666666]',
          )}
        >
          {STATUS_LABEL[campaign.status] ?? campaign.status}
        </span>
      </div>

      {/* Driver setup */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[11px] font-bold tracking-[1.5px] text-[#666666] uppercase">
          <span>Drivers</span>
          <span>{fmt(campaign.requestedDriverCount)}</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[12px]">
          <Metric label="Required / month" value={`${fmt(campaign.requiredMonthlyBudgetVnd)} ₫`} />
          <Metric label="Monthly cap" value={`${fmt(campaign.monthlyCapVnd)} ₫`} />
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

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-[#e5e5e2] bg-[#f7f8fa] p-2">
      <p className="text-[10px] font-bold tracking-[1px] text-[#666666] uppercase">{label}</p>
      <p className="font-mono text-[12px] font-bold text-[#1a1a1a]">{value}</p>
    </div>
  )
}
