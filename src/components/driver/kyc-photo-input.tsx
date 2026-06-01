'use client'

/**
 * KycPhotoInput — file button with FileReader live preview.
 * Preview is data-URL only (never stored in DB).
 */
import Image from 'next/image'
import { useRef, useState } from 'react'

interface Props {
  id: string
  label: string
  name: string
  required?: boolean
  onChange?: (file: File) => void
}

export function KycPhotoInput({ id, label, name, required, onChange }: Props) {
  const ref = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    onChange?.(file)
    // Client-side preview only — data URL never sent to server
    const reader = new FileReader()
    reader.onload = (ev) => setPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className="text-[11px] font-bold tracking-[2.5px] text-[#666666] uppercase"
      >
        {label}
      </label>

      {/* Hidden real input — name passed as form field */}
      <input
        ref={ref}
        id={id}
        name={name}
        type="file"
        accept="image/*"
        capture="environment"
        required={required}
        className="sr-only"
        onChange={handleChange}
      />

      {/* Tap target */}
      <button
        type="button"
        onClick={() => ref.current?.click()}
        aria-label={fileName ? `${label}: ${fileName} — tap to change` : `Upload ${label}`}
        className={`focus-visible:ring-primary flex h-[52px] w-full items-center justify-center rounded-md border text-[13px] font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none ${
          fileName
            ? 'border-primary/40 bg-primary/5 text-primary'
            : 'border-[#cbccc9] bg-[#f7f8fa] text-[#666666] hover:border-[#1a1a1a]'
        }`}
      >
        {fileName ? `✓ ${fileName}` : `Tap to upload`}
      </button>

      {/* Live preview thumbnail */}
      {preview && (
        <Image
          src={preview}
          alt={`Preview of ${label}`}
          width={320}
          height={180}
          className="h-[120px] w-full rounded border border-[#cbccc9] object-cover"
          unoptimized
        />
      )}
    </div>
  )
}
