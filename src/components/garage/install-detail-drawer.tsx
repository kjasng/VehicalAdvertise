'use client'

import { useCallback, useEffect } from 'react'

import { Car, ExternalLink, Megaphone, Phone, Upload, User, X } from 'lucide-react'
import Link from 'next/link'

import type { GarageInstallJob } from '@/lib/garage/types'
import { cn } from '@/lib/utils'

import { INSTALL_STATUS_LABEL, INSTALL_STATUS_PILL } from './install-status-config'

interface Props {
  order: GarageInstallJob | null
  onClose: () => void
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-[11px] font-bold tracking-[2px] text-[#666666] uppercase">{label}</p>
      <div className="text-[14px] text-[#1a1a1a]">{value}</div>
    </div>
  )
}

export function InstallDetailDrawer({ order, onClose }: Props) {
  const isOpen = order !== null
  const canUpload = order?.status === 'waiting_install' || order?.status === 'rejected'

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

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/40 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        aria-hidden="true"
        onClick={onClose}
      />
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
            <div className="flex items-center justify-between border-b border-[#cbccc9] px-6 py-5">
              <div className="space-y-0.5">
                <p className="text-[11px] font-bold tracking-[2.5px] text-[#ff5c00] uppercase">
                  Đơn lắp đặt
                </p>
                <h2 className="font-heading text-[28px] leading-none text-[#1a1a1a] uppercase">
                  {order.id.slice(0, 8)}
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

            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-4">
              <section className="space-y-3" aria-labelledby="drw-vehicle">
                <h3
                  id="drw-vehicle"
                  className="inline-flex items-center gap-2 text-[12px] font-extrabold tracking-[1.5px] text-[#666666] uppercase"
                >
                  <Car className="size-4" aria-hidden="true" />
                  Thông tin xe
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <DetailRow label="Biển số" value={order.vehiclePlate} />
                  <DetailRow label="Contract" value={order.contractStatus.replaceAll('_', ' ')} />
                </div>
              </section>

              <section className="space-y-3" aria-labelledby="drw-campaign">
                <h3
                  id="drw-campaign"
                  className="inline-flex items-center gap-2 text-[12px] font-extrabold tracking-[1.5px] text-[#666666] uppercase"
                >
                  <Megaphone className="size-4" aria-hidden="true" />
                  Chiến dịch
                </h3>
                <DetailRow label="Tên chiến dịch" value={order.campaignName} />
                {order.creativeUrl && (
                  <a
                    href={order.creativeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#ff5c00] hover:underline"
                  >
                    <ExternalLink className="size-3.5" aria-hidden="true" />
                    Xem creative/decal
                  </a>
                )}
              </section>

              <section className="space-y-3" aria-labelledby="drw-contact">
                <h3
                  id="drw-contact"
                  className="inline-flex items-center gap-2 text-[12px] font-extrabold tracking-[1.5px] text-[#666666] uppercase"
                >
                  <User className="size-4" aria-hidden="true" />
                  Driver
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <DetailRow label="Họ tên" value={order.driverName} />
                  <DetailRow
                    label="Số điện thoại"
                    value={
                      order.driverPhone ? (
                        <a
                          href={`tel:${order.driverPhone}`}
                          className="inline-flex items-center gap-1.5 text-[#ff5c00] hover:underline"
                        >
                          <Phone className="size-3.5" aria-hidden="true" />
                          {order.driverPhone}
                        </a>
                      ) : (
                        '—'
                      )
                    }
                  />
                </div>
              </section>

              <DetailRow
                label="Proof"
                value={`${order.proofTotal} ảnh · ${order.proofPending} chờ duyệt · ${order.proofRejected} bị từ chối`}
              />
              {order.latestRejectReason && (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-[13px] text-red-700">
                  {order.latestRejectReason}
                </div>
              )}
              {order.note && <DetailRow label="Ghi chú" value={order.note} />}
            </div>

            <div className="border-t border-[#cbccc9] px-6 py-4">
              <Link
                href={`/garage/proof-upload?contract=${order.id}`}
                className={cn(
                  'flex w-full items-center justify-center gap-2 rounded-md px-4 py-3 text-[14px] font-bold tracking-[0.5px]',
                  canUpload
                    ? 'bg-[#ff5c00] text-white hover:bg-[#e05200]'
                    : 'pointer-events-none bg-[#f0f0ee] text-[#999]',
                )}
                aria-disabled={!canUpload}
              >
                <Upload className="size-4" aria-hidden="true" />
                {canUpload ? 'Upload ảnh lắp decal' : 'Không cần upload'}
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  )
}
