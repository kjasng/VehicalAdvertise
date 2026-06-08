import { redirect } from 'next/navigation'

import { EmptyState } from '@/components/shared/empty-state'
import { PageHeader } from '@/components/shared/page-header'
import { SectionShell } from '@/components/shared/section-shell'
import { getDriverGarageSelectionData } from '@/lib/driver/queries-garage-selection'

import { GarageSelectionClient } from './garage-selection-client'

export const metadata = { title: 'Driver · Garage' }

export default async function DriverGaragePage() {
  const data = await getDriverGarageSelectionData()
  if (!data) redirect('/login')

  const contract = data.contract

  return (
    <div className="space-y-6">
      <PageHeader kicker="INSTALL" title="Garage Selection" />

      {!contract ? (
        <EmptyState
          kicker="empty"
          title="No Campaign Yet"
          helper="Bạn chưa có campaign/contract cần lắp decal."
        />
      ) : contract.selectedGarage ? (
        <SectionShell title="Garage đã chọn">
          <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
            <div className="space-y-3">
              <p className="text-[14px] text-[#666666]">
                Xe <span className="font-mono text-[#1a1a1a]">{contract.vehiclePlate}</span> đang
                được gắn với campaign <span className="font-semibold">{contract.campaignName}</span>
                .
              </p>
              <div className="rounded-md border border-[#cbccc9] bg-[#f7f8fa] p-4">
                <h2 className="text-[15px] font-bold text-[#1a1a1a]">
                  {contract.selectedGarage.shopName}
                </h2>
                <p className="mt-1 text-[13px] text-[#666666]">{contract.selectedGarage.address}</p>
                {contract.selectedGarage.phone && (
                  <p className="mt-1 text-[13px] text-[#666666]">
                    Phone: {contract.selectedGarage.phone}
                  </p>
                )}
                {contract.selectedGarage.workingHours && (
                  <p className="mt-1 text-[13px] text-[#666666]">
                    Working hours: {contract.selectedGarage.workingHours}
                  </p>
                )}
                {contract.selectedGarage.googleMapsUrl && (
                  <a
                    href={contract.selectedGarage.googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex text-[12px] font-bold text-[#ff5c00] hover:underline"
                  >
                    Mở Google Maps
                  </a>
                )}
              </div>
            </div>
            <div className="rounded-md border border-[#cbccc9] bg-white p-4">
              <p className="mb-2 text-[11px] font-bold tracking-[2.5px] text-[#ff5c00] uppercase">
                Hướng dẫn
              </p>
              <ol className="list-decimal space-y-2 pl-4 text-[13px] text-[#666666]">
                <li>Liên hệ garage để thống nhất thời gian mang xe tới.</li>
                <li>Mang xe sạch, đúng biển số đã đăng ký trong hệ thống.</li>
                <li>Garage sẽ upload ảnh sau khi lắp decal xong.</li>
                <li>Admin approve ảnh thì bạn mới bắt đầu earning.</li>
              </ol>
            </div>
          </div>
        </SectionShell>
      ) : data.garages.length === 0 ? (
        <EmptyState
          kicker="empty"
          title="No Garages"
          helper="Chưa có garage để chọn. Vui lòng quay lại sau."
        />
      ) : (
        <SectionShell title={`${contract.campaignName} · ${contract.vehiclePlate}`}>
          <GarageSelectionClient contractId={contract.id} garages={data.garages} />
        </SectionShell>
      )}
    </div>
  )
}
