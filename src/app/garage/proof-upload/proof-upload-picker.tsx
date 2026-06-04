'use client'

import { useState } from 'react'

import { PhotoCaptureGrid } from '@/components/garage/photo-capture-grid'
import { SectionShell } from '@/components/shared/section-shell'
import type { GarageInstallJob } from '@/lib/garage/types'

export function ProofUploadPicker({
  jobs,
  initialContractId,
}: {
  jobs: GarageInstallJob[]
  initialContractId: string
}) {
  const [selectedId, setSelectedId] = useState(initialContractId)
  const selectedOrder = jobs.find((job) => job.id === selectedId) ?? null

  return (
    <>
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
          >
            <option value="">-- Chọn đơn hàng --</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.vehiclePlate} · {job.campaignName}
              </option>
            ))}
          </select>
        </div>
      </SectionShell>

      {selectedOrder ? (
        <SectionShell title={`Ảnh bằng chứng - ${selectedOrder.vehiclePlate}`}>
          <div className="mb-4 flex flex-wrap gap-x-6 gap-y-1 text-[13px] text-[#666666]">
            <span>
              <strong className="text-[#1a1a1a]">Xe:</strong> {selectedOrder.vehiclePlate} ·{' '}
              {selectedOrder.vehicleModel}
            </span>
            <span>
              <strong className="text-[#1a1a1a]">Chiến dịch:</strong> {selectedOrder.campaignName}
            </span>
          </div>
          <PhotoCaptureGrid contractId={selectedOrder.id} />
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
    </>
  )
}
