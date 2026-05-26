'use client'

/**
 * Garage Proof Upload — select an install order then capture 4-angle photos.
 */
import { useState } from 'react'

import { PageHeader } from '@/components/shared/page-header'
import { SectionShell } from '@/components/shared/section-shell'
import { PhotoCaptureGrid } from '@/components/garage/photo-capture-grid'
import { MOCK_INSTALL_ORDERS } from '@/components/garage/mock-data'

const ELIGIBLE_ORDERS = MOCK_INSTALL_ORDERS.filter(
  (o) => o.status === 'awaiting_install' || o.status === 'matched',
)

export default function GarageProofUploadPage() {
  const [selectedId, setSelectedId] = useState<string>('')

  const selectedOrder = ELIGIBLE_ORDERS.find((o) => o.id === selectedId) ?? null

  return (
    <div className="flex flex-col gap-8">
      <PageHeader kicker="PROOF" title="UPLOAD INSTALL PHOTOS" />

      <SectionShell title="Chọn đơn lắp đặt">
        <div className="flex max-w-sm flex-col gap-2">
          <label
            htmlFor="order-picker"
            className="text-[11px] font-bold tracking-[2px] text-[#666666] uppercase"
          >
            Đơn hàng
          </label>
          <select
            id="order-picker"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="rounded-md border border-[#cbccc9] bg-white px-3 py-2.5 text-[14px] text-[#1a1a1a] focus:border-transparent focus:ring-2 focus:ring-[#ff5c00] focus:outline-none"
            aria-label="Chọn đơn lắp đặt để upload ảnh"
          >
            <option value="">— Chọn đơn hàng —</option>
            {ELIGIBLE_ORDERS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.id} · {o.vehiclePlate} · {o.campaignName}
              </option>
            ))}
          </select>
        </div>
      </SectionShell>

      {selectedOrder ? (
        <SectionShell title={`Ảnh bằng chứng — ${selectedOrder.id}`}>
          <div className="mb-4 flex flex-wrap gap-x-6 gap-y-1 text-[13px] text-[#666666]">
            <span>
              <strong className="text-[#1a1a1a]">Xe:</strong> {selectedOrder.vehiclePlate} ·{' '}
              {selectedOrder.vehicleModel}
            </span>
            <span>
              <strong className="text-[#1a1a1a]">Chiến dịch:</strong> {selectedOrder.campaignName}
            </span>
            <span>
              <strong className="text-[#1a1a1a]">Vị trí:</strong> {selectedOrder.creativePosition}
            </span>
          </div>
          <PhotoCaptureGrid orderId={selectedOrder.id} />
        </SectionShell>
      ) : (
        <div className="rounded-md border border-dashed border-[#cbccc9] px-6 py-12 text-center">
          <p className="mb-2 text-[11px] font-bold tracking-[2.5px] text-[#ff5c00] uppercase">
            CHƯA CHỌN ĐƠN
          </p>
          <p className="text-[14px] text-[#666666]">
            Chọn một đơn lắp đặt ở trên để bắt đầu upload ảnh bằng chứng.
          </p>
        </div>
      )}
    </div>
  )
}
