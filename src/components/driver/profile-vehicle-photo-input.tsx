'use client'

/**
 * ProfileVehiclePhotoInput — isolated client component.
 * Camera file input for vehicle photo on the profile page.
 */
import { useRef } from 'react'

import { Camera } from 'lucide-react'
import { toast } from 'sonner'

export function ProfileVehiclePhotoInput() {
  const ref = useRef<HTMLInputElement>(null)

  return (
    <div>
      <p className="mb-2 text-[11px] font-bold tracking-[2.5px] text-[#666666] uppercase">
        Vehicle photo
      </p>
      <button
        type="button"
        onClick={() => ref.current?.click()}
        className={[
          'flex h-[56px] w-full items-center justify-center gap-2 rounded-md border border-[#cbccc9]',
          'bg-[#f7f8fa] text-[13px] text-[#666666] transition-colors hover:border-[#1a1a1a]',
          'focus-visible:ring-primary focus-visible:ring-2 focus-visible:outline-none',
        ].join(' ')}
        aria-label="Upload vehicle photo"
      >
        <Camera className="size-4" aria-hidden="true" />
        Tap to upload vehicle photo
      </button>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) toast.success(`Photo selected: ${f.name}`)
        }}
      />
    </div>
  )
}
