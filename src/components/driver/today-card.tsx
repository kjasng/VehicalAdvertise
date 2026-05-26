/**
 * TodayCard — server component.
 * Shows today's KM (Anton numeral), today's earnings VND,
 * active campaign label, and "Take verification photo" CTA.
 */
import Link from 'next/link'

import { Camera } from 'lucide-react'

import { buttonVariants } from '@/components/ui/button'
import { SectionShell } from '@/components/shared/section-shell'

import type { TodayStats } from './mock-data'

interface TodayCardProps {
  stats: TodayStats
}

export function TodayCard({ stats }: TodayCardProps) {
  const earningsFormatted = stats.earningsVnd.toLocaleString('vi-VN')

  return (
    <SectionShell variant="dark">
      {/* Campaign badge */}
      <p className="mb-4 text-[11px] font-bold tracking-[2.5px] text-white/50 uppercase">
        Active&nbsp;
        <span className="text-primary">{stats.campaignLabel}</span>
        &nbsp;—&nbsp;{stats.campaignName}
      </p>

      {/* KM numeral */}
      <div className="flex items-baseline gap-3">
        <p
          className="font-heading text-[72px] leading-none text-white"
          aria-label={`${stats.kmToday} km today`}
        >
          {stats.kmToday}
        </p>
        <span className="font-heading text-[28px] leading-none text-white/40 uppercase">km</span>
      </div>
      <p className="mt-1 text-[11px] font-bold tracking-[2.5px] text-white/50 uppercase">Today</p>

      {/* Earnings row */}
      <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
        <div>
          <p className="text-[11px] font-bold tracking-[2.5px] text-white/50 uppercase">
            Earnings today
          </p>
          <p className="font-heading mt-1 text-[32px] leading-none text-white">
            {earningsFormatted}
            <span className="font-heading ml-1 text-[16px] text-white/50">₫</span>
          </p>
        </div>

        {/* CTA */}
        <Link
          href="/driver/verify"
          className={buttonVariants({
            className:
              'bg-primary hover:bg-primary/90 h-12 gap-2 rounded-md px-5 text-[13px] font-bold tracking-[1px] text-white uppercase',
          })}
          aria-label="Take verification photo"
        >
          <Camera className="size-4" aria-hidden="true" />
          Verify
        </Link>
      </div>
    </SectionShell>
  )
}
