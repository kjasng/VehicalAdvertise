'use client'

import { useTransition } from 'react'

import { MapPin, Phone, Wrench } from 'lucide-react'
import { toast } from 'sonner'

import { selectDriverInstallGarage } from '@/app/driver/garage/actions'
import type { DriverGarageOption } from '@/lib/driver/queries-garage-selection'

export function GarageSelectionClient({
  contractId,
  garages,
}: {
  contractId: string
  garages: DriverGarageOption[]
}) {
  const [pending, startTransition] = useTransition()

  function handleSelect(garageId: string) {
    startTransition(async () => {
      const result = await selectDriverInstallGarage({ contractId, garageId })
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success('Đã chọn garage lắp decal.')
    })
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {garages.map((garage) => (
        <article key={garage.id} className="rounded-md border border-[#cbccc9] bg-white p-4">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[15px] font-bold text-[#1a1a1a]">{garage.shopName}</h2>
              {garage.suggested && (
                <span className="mt-1 inline-block rounded bg-[#ff5c00]/10 px-2 py-0.5 text-[10px] font-bold tracking-[1px] text-[#ff5c00] uppercase">
                  Suggested nearby
                </span>
              )}
            </div>
            <button
              type="button"
              disabled={pending}
              onClick={() => handleSelect(garage.id)}
              className="flex h-9 shrink-0 items-center gap-1.5 rounded bg-[#1a1a1a] px-3 text-[12px] font-bold text-white hover:bg-[#333] disabled:opacity-50"
            >
              <Wrench className="size-3.5" aria-hidden="true" />
              Chọn
            </button>
          </div>

          <div className="space-y-2 text-[13px] text-[#666666]">
            <p className="flex gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>{garage.address}</span>
            </p>
            {garage.phone && (
              <a href={`tel:${garage.phone}`} className="flex gap-2 text-[#ff5c00] hover:underline">
                <Phone className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                {garage.phone}
              </a>
            )}
            {garage.workingHours && <p>Giờ làm việc: {garage.workingHours}</p>}
            {garage.serviceArea && <p>Khu vực: {garage.serviceArea}</p>}
            {garage.googleMapsUrl && (
              <a
                href={garage.googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex text-[12px] font-bold text-[#ff5c00] hover:underline"
              >
                Mở Google Maps
              </a>
            )}
          </div>
        </article>
      ))}
    </div>
  )
}
