'use client'

import { useRef, useState, useTransition } from 'react'

import imageCompression from 'browser-image-compression'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { submitGarageInstallProof } from '@/app/garage/proof-upload/actions'
import { cn } from '@/lib/utils'

import { PhotoSlot, type ProofAngle } from './photo-slot'

const ANGLES: { key: ProofAngle; label: string }[] = [
  { key: 'front', label: 'Mặt trước' },
  { key: 'rear', label: 'Mặt sau' },
  { key: 'left', label: 'Hông trái' },
  { key: 'right', label: 'Hông phải' },
  { key: 'closeup', label: 'Cận decal' },
]

const COMPRESSION_OPTIONS = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
}

interface PhotoCaptureGridProps {
  contractId: string
}

export function PhotoCaptureGrid({ contractId }: PhotoCaptureGridProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [note, setNote] = useState('')
  const [files, setFiles] = useState<Partial<Record<ProofAngle, File>>>({})
  const [previews, setPreviews] = useState<Partial<Record<ProofAngle, string>>>({})
  const inputRefs = useRef<Partial<Record<ProofAngle, HTMLInputElement | null>>>({})

  async function handleFileChange(angle: ProofAngle, file: File | undefined) {
    if (!file) return
    try {
      const compressed = await imageCompression(file, COMPRESSION_OPTIONS)
      const preview = URL.createObjectURL(compressed)
      setFiles((prev) => ({ ...prev, [angle]: compressed }))
      setPreviews((prev) => {
        if (prev[angle]) URL.revokeObjectURL(prev[angle])
        return { ...prev, [angle]: preview }
      })
    } catch (err) {
      console.error('[PhotoCaptureGrid] Compression error:', err)
      toast.error('Không thể xử lý ảnh. Vui lòng thử lại.')
    }
  }

  function handleClear(angle: ProofAngle) {
    const prev = previews[angle]
    if (prev) URL.revokeObjectURL(prev)
    setPreviews((current) => removeKey(current, angle))
    setFiles((current) => removeKey(current, angle))
    const input = inputRefs.current[angle]
    if (input) input.value = ''
  }

  function handleSubmit() {
    if (!ANGLES.every((angle) => files[angle.key])) {
      toast.error('Vui lòng upload đủ 5 ảnh.')
      return
    }

    startTransition(async () => {
      const formData = new FormData()
      formData.set('contractId', contractId)
      formData.set('note', note)
      for (const angle of ANGLES) {
        const file = files[angle.key]
        if (file) formData.set(angle.key, file)
      }
      const result = await submitGarageInstallProof(formData)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success('Đã gửi ảnh lắp decal cho admin duyệt.')
      setNote('')
      setFiles({})
      setPreviews({})
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {ANGLES.map(({ key, label }) => (
          <PhotoSlot
            key={key}
            angle={key}
            label={label}
            preview={previews[key]}
            inputRef={(el) => {
              inputRefs.current[key] = el
            }}
            onChange={handleFileChange}
            onClear={handleClear}
          />
        ))}
      </div>

      <label htmlFor="install-note" className="block space-y-1">
        <span className="text-[11px] font-bold tracking-[2px] text-[#666666] uppercase">
          Ghi chú
        </span>
        <textarea
          id="install-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          className="focus:ring-primary w-full rounded border border-[#cbccc9] px-3 py-2 text-[13px] text-[#1a1a1a] focus:ring-2 focus:outline-none"
          placeholder="Ghi chú nếu có"
        />
      </label>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={pending}
        className={cn(
          'self-start rounded-md px-6 py-3 text-[14px] font-bold tracking-[0.5px] transition-colors duration-150',
          'focus-visible:ring-2 focus-visible:ring-[#ff5c00] focus-visible:ring-offset-2 focus-visible:outline-none',
          pending
            ? 'cursor-not-allowed bg-[#f0f0ee] text-[#999]'
            : 'bg-[#1a1a1a] text-white hover:bg-[#333]',
        )}
      >
        {pending ? 'Đang gửi...' : 'Gửi bằng chứng lắp đặt'}
      </button>
    </div>
  )
}

function removeKey<T extends Record<string, unknown>, K extends keyof T>(value: T, key: K): T {
  const next = { ...value }
  delete next[key]
  return next
}
