import { Camera, X } from 'lucide-react'

export type ProofAngle = 'front' | 'rear' | 'left' | 'right'

export function PhotoSlot({
  angle,
  label,
  preview,
  inputRef,
  onChange,
  onClear,
}: {
  angle: ProofAngle
  label: string
  preview?: string
  inputRef: (el: HTMLInputElement | null) => void
  onChange: (angle: ProofAngle, file: File | undefined) => void
  onClear: (angle: ProofAngle) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[11px] font-bold tracking-[2px] text-[#666666] uppercase">{label}</p>
      <div className="relative">
        {preview ? (
          <div className="relative aspect-square overflow-hidden rounded-md border-2 border-[#ff5c00]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt={`Ảnh ${label}`} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onClear(angle)}
              className="absolute top-1.5 right-1.5 rounded-full bg-black/60 p-1 text-white hover:bg-black/80 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
              aria-label={`Xóa ảnh ${label}`}
            >
              <X className="size-3.5" aria-hidden="true" />
            </button>
          </div>
        ) : (
          <label
            htmlFor={`photo-${angle}`}
            className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-[#cbccc9] bg-[#f7f8fa] hover:border-[#ff5c00] hover:bg-[#fff5f0]"
          >
            <Camera className="size-7 text-[#cbccc9]" aria-hidden="true" />
            <span className="text-[11px] font-medium text-[#999]">Chụp ảnh</span>
            <input
              id={`photo-${angle}`}
              ref={inputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              onChange={(e) => onChange(angle, e.target.files?.[0])}
            />
          </label>
        )}
      </div>
    </div>
  )
}
