'use client'

/**
 * PhotoCaptureGrid — client component.
 * 4-slot grid (front / rear / left / right) for install proof photos.
 * Each slot: file input with camera capture, inline preview on upload.
 * Compress with browser-image-compression before stub submit.
 */
import { useRef, useState } from 'react'

import imageCompression from 'browser-image-compression'
import { Camera, X } from 'lucide-react'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'

type Angle = 'front' | 'rear' | 'left' | 'right'

const ANGLES: { key: Angle; label: string }[] = [
  { key: 'front', label: 'Phía trước' },
  { key: 'rear', label: 'Phía sau' },
  { key: 'left', label: 'Bên trái' },
  { key: 'right', label: 'Bên phải' },
]

const COMPRESSION_OPTIONS = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
}

interface PhotoCaptureGridProps {
  orderId: string
}

export function PhotoCaptureGrid({ orderId }: PhotoCaptureGridProps) {
  const [previews, setPreviews] = useState<Partial<Record<Angle, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const inputRefs = useRef<Partial<Record<Angle, HTMLInputElement | null>>>({})

  async function handleFileChange(angle: Angle, file: File | undefined) {
    if (!file) return
    try {
      const compressed = await imageCompression(file, COMPRESSION_OPTIONS)
      const url = URL.createObjectURL(compressed)
      setPreviews((prev) => ({ ...prev, [angle]: url }))
    } catch (err) {
      console.error('[PhotoCaptureGrid] Compression error:', err)
      toast.error('Không thể xử lý ảnh. Vui lòng thử lại.')
    }
  }

  function handleClear(angle: Angle) {
    const prev = previews[angle]
    if (prev) URL.revokeObjectURL(prev)
    setPreviews((p) => {
      const next = { ...p }
      delete next[angle]
      return next
    })
    const input = inputRefs.current[angle]
    if (input) input.value = ''
  }

  async function handleSubmit() {
    const filled = ANGLES.filter((a) => previews[a.key])
    if (filled.length === 0) {
      toast.error('Vui lòng chụp ít nhất một ảnh.')
      return
    }
    setIsSubmitting(true)
    try {
      // Stub: log and toast — real upload wired in PDR P3
      console.log(
        '[PhotoCaptureGrid] Submit proofs for order:',
        orderId,
        'angles:',
        filled.map((a) => a.key),
      )
      await new Promise((r) => setTimeout(r, 600))
      toast.success(`Đã gửi ${filled.length} ảnh cho đơn ${orderId}.`)
    } catch (err) {
      console.error('[PhotoCaptureGrid] Submit error:', err)
      toast.error('Gửi ảnh thất bại. Vui lòng thử lại.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const allFilled = ANGLES.every((a) => previews[a.key])

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {ANGLES.map(({ key, label }) => {
          const preview = previews[key]
          return (
            <div key={key} className="flex flex-col gap-2">
              <p className="text-[11px] font-bold tracking-[2px] text-[#666666] uppercase">
                {label}
              </p>

              <div className="relative">
                {preview ? (
                  <div className="relative aspect-square overflow-hidden rounded-md border-2 border-[#ff5c00]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={preview}
                      alt={`Ảnh ${label}`}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleClear(key)}
                      className={cn(
                        'absolute top-1.5 right-1.5 rounded-full bg-black/60 p-1 text-white',
                        'hover:bg-black/80 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none',
                      )}
                      aria-label={`Xóa ảnh ${label}`}
                    >
                      <X className="size-3.5" aria-hidden="true" />
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor={`photo-${key}`}
                    className={cn(
                      'flex aspect-square cursor-pointer flex-col items-center justify-center gap-2',
                      'rounded-md border-2 border-dashed border-[#cbccc9] bg-[#f7f8fa]',
                      'transition-colors duration-150 hover:border-[#ff5c00] hover:bg-[#fff5f0]',
                      'focus-within:border-[#ff5c00] focus-within:ring-2 focus-within:ring-[#ff5c00] focus-within:ring-offset-1',
                    )}
                  >
                    <Camera className="size-7 text-[#cbccc9]" aria-hidden="true" />
                    <span className="text-[11px] font-medium text-[#999]">Chụp ảnh</span>
                    <input
                      id={`photo-${key}`}
                      ref={(el) => {
                        inputRefs.current[key] = el
                      }}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="sr-only"
                      aria-label={`Chụp ảnh ${label}`}
                      onChange={(e) => handleFileChange(key, e.target.files?.[0])}
                    />
                  </label>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitting}
        className={cn(
          'self-start rounded-md px-6 py-3 text-[14px] font-bold tracking-[0.5px] transition-colors duration-150',
          'focus-visible:ring-2 focus-visible:ring-[#ff5c00] focus-visible:ring-offset-2 focus-visible:outline-none',
          isSubmitting
            ? 'cursor-not-allowed bg-[#f0f0ee] text-[#999]'
            : allFilled
              ? 'bg-[#ff5c00] text-white hover:bg-[#e05200]'
              : 'bg-[#1a1a1a] text-white hover:bg-[#333]',
        )}
        aria-disabled={isSubmitting}
      >
        {isSubmitting ? 'Đang gửi…' : 'Gửi bằng chứng lắp đặt'}
      </button>
    </div>
  )
}
