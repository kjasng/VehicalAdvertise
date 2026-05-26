/**
 * InstallCard — server component.
 * Single install order summary tile for dashboard and list views.
 * Pencil-styled border, large touch targets for tablet use.
 */
import { Clock, Car, Megaphone } from 'lucide-react'

import { cn } from '@/lib/utils'

import type { InstallOrder } from './mock-data'
import { INSTALL_STATUS_LABEL, INSTALL_STATUS_PILL } from './install-status-config'

interface InstallCardProps {
  order: InstallOrder
  /** If provided, wraps the card in a clickable button */
  onClick?: () => void
}

export function InstallCard({ order, onClick }: InstallCardProps) {
  const label = INSTALL_STATUS_LABEL[order.status]
  const pillClass = INSTALL_STATUS_PILL[order.status]

  const card = (
    <article
      className={cn(
        'flex flex-col gap-3 rounded-md border border-[#cbccc9] bg-white p-4',
        'transition-shadow duration-150',
        onClick && 'cursor-pointer hover:shadow-md',
      )}
    >
      {/* Header: time slot + status pill */}
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#1a1a1a]">
          <Clock className="size-4 text-[#666666]" aria-hidden="true" />
          {order.timeSlot}
        </span>
        <span
          className={cn(
            'rounded px-2 py-0.5 text-[11px] font-bold tracking-[1px] uppercase',
            pillClass,
          )}
          aria-label={`Trạng thái: ${label}`}
        >
          {label}
        </span>
      </div>

      {/* Vehicle row */}
      <div className="flex items-center gap-1.5 text-[13px] text-[#1a1a1a]">
        <Car className="size-4 shrink-0 text-[#666666]" aria-hidden="true" />
        <span className="font-mono font-semibold">{order.vehiclePlate}</span>
        <span className="text-[#666666]">·</span>
        <span>{order.vehicleModel}</span>
        <span className="text-[#666666]">·</span>
        <span className="text-[#666666]">{order.vehicleColor}</span>
      </div>

      {/* Campaign row */}
      <div className="flex items-center gap-1.5 text-[13px] text-[#666666]">
        <Megaphone className="size-4 shrink-0" aria-hidden="true" />
        <span className="truncate">{order.campaignName}</span>
      </div>

      {/* District */}
      <p className="text-[11px] font-bold tracking-[2px] text-[#666666] uppercase">
        {order.district}
      </p>
    </article>
  )

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="w-full rounded-md text-left focus-visible:ring-2 focus-visible:ring-[#ff5c00] focus-visible:ring-offset-2 focus-visible:outline-none"
        aria-label={`Xem chi tiết đơn ${order.id} — ${order.vehiclePlate}`}
      >
        {card}
      </button>
    )
  }

  return card
}
