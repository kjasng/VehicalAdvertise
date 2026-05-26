'use client'

/**
 * InstallDetailDrawer — client component.
 * Slide-in drawer (right, 480px) showing full install order details.
 * A11y: role="dialog", aria-modal, Escape-to-close, backdrop click.
 */
import { useEffect, useCallback } from 'react'

import { X, Car, Megaphone, Ruler, User, Phone } from 'lucide-react'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'

import type { InstallOrder } from './mock-data'
import { INSTALL_STATUS_LABEL, INSTALL_STATUS_PILL } from './install-status-config'

interface Props {
  order: InstallOrder | null
  onClose: () => void
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-[11px] font-bold tracking-[2px] text-[#666666] uppercase">{label}</p>
      <p className="text-[14px] text-[#1a1a1a]">{value}</p>
    </div>
  )
}

export function InstallDetailDrawer({ order, onClose }: Props) {
  const isOpen = order !== null

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose],
  )

  useEffect(() => {
    if (!isOpen) return
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleKeyDown])

  function handleMarkInstalled() {
    if (!order) return
    console.log('[InstallDetailDrawer] Mark installed:', order.id)
    toast.success(`Đơn ${order.id} đã được đánh dấu hoàn thành.`)
    onClose()
  }

  const isDone = order?.status === 'installed' || order?.status === 'terminated'

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/40 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={order ? `Chi tiết đơn ${order.id}` : 'Chi tiết đơn lắp đặt'}
        className={cn(
          'fixed top-0 right-0 z-50 flex h-full w-full max-w-[480px] flex-col bg-white shadow-xl',
          'transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {order && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#cbccc9] px-6 py-5">
              <div className="space-y-0.5">
                <p className="text-[11px] font-bold tracking-[2.5px] text-[#ff5c00] uppercase">
                  Đơn lắp đặt
                </p>
                <h2 className="font-heading text-[28px] leading-none text-[#1a1a1a] uppercase">
                  {order.id}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded p-2 text-[#666666] hover:bg-[#f7f8fa] hover:text-[#1a1a1a] focus-visible:ring-2 focus-visible:ring-[#ff5c00] focus-visible:outline-none"
                aria-label="Đóng"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>

            {/* Status pill */}
            <div className="px-6 pt-4">
              <span
                className={cn(
                  'inline-block rounded px-2.5 py-1 text-[11px] font-bold tracking-[1px] uppercase',
                  INSTALL_STATUS_PILL[order.status],
                )}
              >
                {INSTALL_STATUS_LABEL[order.status]}
              </span>
            </div>

            {/* Body */}
            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-4">
              <section aria-labelledby="drw-vehicle">
                <h3
                  id="drw-vehicle"
                  className="mb-3 inline-flex items-center gap-2 text-[12px] font-extrabold tracking-[1.5px] text-[#666666] uppercase"
                >
                  <Car className="size-4" aria-hidden="true" />
                  Thông tin xe
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <DetailRow label="Biển số" value={order.vehiclePlate} />
                  <DetailRow label="Dòng xe" value={order.vehicleModel} />
                  <DetailRow label="Màu sắc" value={order.vehicleColor} />
                  <DetailRow label="Quận / Huyện" value={order.district} />
                </div>
              </section>

              <section aria-labelledby="drw-campaign">
                <h3
                  id="drw-campaign"
                  className="mb-3 inline-flex items-center gap-2 text-[12px] font-extrabold tracking-[1.5px] text-[#666666] uppercase"
                >
                  <Megaphone className="size-4" aria-hidden="true" />
                  Chiến dịch
                </h3>
                <DetailRow label="Tên chiến dịch" value={order.campaignName} />
              </section>

              <section aria-labelledby="drw-creative">
                <h3
                  id="drw-creative"
                  className="mb-3 inline-flex items-center gap-2 text-[12px] font-extrabold tracking-[1.5px] text-[#666666] uppercase"
                >
                  <Ruler className="size-4" aria-hidden="true" />
                  Thông số sáng tạo
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <DetailRow label="Kích thước" value={order.creativeSize} />
                  <DetailRow label="Vị trí dán" value={order.creativePosition} />
                </div>
              </section>

              <section aria-labelledby="drw-contact">
                <h3
                  id="drw-contact"
                  className="mb-3 inline-flex items-center gap-2 text-[12px] font-extrabold tracking-[1.5px] text-[#666666] uppercase"
                >
                  <User className="size-4" aria-hidden="true" />
                  Liên hệ khách hàng
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <DetailRow label="Họ tên" value={order.customerName} />
                  <div className="flex flex-col gap-0.5">
                    <p className="text-[11px] font-bold tracking-[2px] text-[#666666] uppercase">
                      Số điện thoại
                    </p>
                    <a
                      href={`tel:${order.customerPhone.replace(/\s/g, '')}`}
                      className="inline-flex items-center gap-1.5 rounded text-[14px] text-[#ff5c00] underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:ring-[#ff5c00] focus-visible:outline-none"
                      aria-label={`Gọi ${order.customerPhone}`}
                    >
                      <Phone className="size-3.5" aria-hidden="true" />
                      {order.customerPhone}
                    </a>
                  </div>
                </div>
              </section>

              <DetailRow label="Khung giờ" value={`${order.timeSlot} — ${order.scheduledDate}`} />
            </div>

            {/* Footer */}
            <div className="border-t border-[#cbccc9] px-6 py-4">
              <button
                type="button"
                onClick={handleMarkInstalled}
                disabled={isDone}
                className={cn(
                  'w-full rounded-md px-4 py-3 text-[14px] font-bold tracking-[0.5px] transition-colors duration-150',
                  'focus-visible:ring-2 focus-visible:ring-[#ff5c00] focus-visible:ring-offset-2 focus-visible:outline-none',
                  isDone
                    ? 'cursor-not-allowed bg-[#f0f0ee] text-[#999]'
                    : 'bg-[#ff5c00] text-white hover:bg-[#e05200]',
                )}
                aria-disabled={isDone}
              >
                {order.status === 'installed' ? 'Đã hoàn thành' : 'Đánh dấu đã lắp'}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}
