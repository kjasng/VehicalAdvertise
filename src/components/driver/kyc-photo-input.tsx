'use client'

/**
 * KycPhotoInput — photo input with camera + library options and live preview.
 * Accepts `file` prop so the parent can persist state across Back/Next navigation.
 * Preview is a data-URL generated client-side — never stored in DB.
 */
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

import { Camera, ImageIcon } from 'lucide-react'

interface Props {
  id: string
  label: string
  name: string
  /** File from parent state — used to restore preview on remount (Back navigation). */
  file?: File | null
  onChange?: (file: File) => void
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result as string)
    reader.readAsDataURL(file)
  })
}

export function KycPhotoInput({ id, label, name, file, onChange }: Props) {
  const cameraRef = useRef<HTMLInputElement>(null)
  const libraryRef = useRef<HTMLInputElement>(null)
  // Initialize fileName immediately so the UI doesn't flash "no file" on remount
  const [fileName, setFileName] = useState<string | null>(file?.name ?? null)
  const [preview, setPreview] = useState<string | null>(null)

  // Restore preview whenever `file` changes or on remount with an existing file
  useEffect(() => {
    if (!file) return
    readAsDataUrl(file).then((dataUrl) => {
      setFileName(file.name)
      setPreview(dataUrl)
    })
  }, [file])

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    const dataUrl = await readAsDataUrl(f)
    setFileName(f.name)
    setPreview(dataUrl)
    onChange?.(f)
    // Reset input so the same file can be re-selected
    e.target.value = ''
  }

  const hasFile = fileName !== null

  return (
    <div className="flex flex-col gap-2">
      <label className="text-[11px] font-bold tracking-[2.5px] text-[#666666] uppercase">
        {label}
      </label>

      {/* Hidden inputs: one forces camera, one opens library */}
      <input
        ref={cameraRef}
        id={id}
        name={name}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={handleChange}
      />
      <input
        ref={libraryRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleChange}
      />

      {/* Two action buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => cameraRef.current?.click()}
          className="focus-visible:ring-primary flex h-[46px] items-center justify-center gap-2 rounded-md border border-[#cbccc9] bg-[#f7f8fa] text-[12px] font-medium text-[#666666] transition-colors hover:border-[#1a1a1a] hover:text-[#1a1a1a] focus-visible:ring-2 focus-visible:outline-none"
        >
          <Camera className="size-4" aria-hidden="true" />
          Take photo
        </button>
        <button
          type="button"
          onClick={() => libraryRef.current?.click()}
          className="focus-visible:ring-primary flex h-[46px] items-center justify-center gap-2 rounded-md border border-[#cbccc9] bg-[#f7f8fa] text-[12px] font-medium text-[#666666] transition-colors hover:border-[#1a1a1a] hover:text-[#1a1a1a] focus-visible:ring-2 focus-visible:outline-none"
        >
          <ImageIcon className="size-4" aria-hidden="true" />
          Library
        </button>
      </div>

      {/* Status + preview */}
      {hasFile && (
        <div className="space-y-1.5">
          <p className="text-primary text-[12px] font-medium">✓ {fileName}</p>
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
          {/* Retake row */}
          <div className="flex gap-2 pt-0.5">
            <button
              type="button"
              onClick={() => cameraRef.current?.click()}
              className="text-[11px] font-medium text-[#666666] underline underline-offset-2 hover:text-[#1a1a1a]"
            >
              Retake
            </button>
            <span className="text-[#cbccc9]">·</span>
            <button
              type="button"
              onClick={() => libraryRef.current?.click()}
              className="text-[11px] font-medium text-[#666666] underline underline-offset-2 hover:text-[#1a1a1a]"
            >
              Change
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
