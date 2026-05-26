'use client'

/**
 * CreativeUploadZone — drag-and-drop zone + click-to-browse fallback.
 * Renders uploaded CreativeCard grid below. Upload is stubbed (log + toast).
 */
import { useCallback, useRef, useState } from 'react'

import { Upload } from 'lucide-react'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'

import { CreativeCard } from './creative-card'
import { MOCK_CREATIVES } from './mock-data'
import type { CreativeAsset } from './mock-data'

export function CreativeUploadZone() {
  const [isDragging, setIsDragging] = useState(false)
  const [assets, setAssets] = useState<CreativeAsset[]>(MOCK_CREATIVES)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return
    Array.from(files).forEach((file) => {
      console.log('[CreativeUploadZone] stub upload:', file.name, file.size)
      toast.success(`Uploaded ${file.name} — pending admin review`)
      // Stub: add a placeholder card
      const stub: CreativeAsset = {
        id: `asset-stub-${Date.now()}`,
        name: file.name,
        imageUrl: `https://placehold.co/400x200/cbccc9/1a1a1a?text=${encodeURIComponent(file.name)}`,
        widthPx: 0,
        heightPx: 0,
        dpi: 0,
        fileSizeKb: Math.round(file.size / 1024),
        status: 'pending',
        uploadedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      }
      setAssets((prev) => [stub, ...prev])
    })
  }, [])

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const onDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles],
  )

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files)
      // Reset so the same file can be re-selected
      e.target.value = ''
    },
    [handleFiles],
  )

  return (
    <div className="space-y-6">
      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload creative files — drag and drop or click to browse"
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-md border-2 border-dashed py-12 transition-colors duration-200',
          isDragging
            ? 'border-[#ff5c00] bg-[#ff5c00]/5'
            : 'border-[#cbccc9] bg-[#f7f8fa] hover:border-[#ff5c00] hover:bg-[#ff5c00]/5',
        )}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            inputRef.current?.click()
          }
        }}
      >
        <Upload
          className={cn(
            'size-8 transition-colors',
            isDragging ? 'text-[#ff5c00]' : 'text-[#cbccc9]',
          )}
          aria-hidden="true"
        />
        <div className="text-center">
          <p className="text-[13px] font-bold text-[#1a1a1a]">
            Drop files here or{' '}
            <span className="text-[#ff5c00] underline underline-offset-2">browse</span>
          </p>
          <p className="mt-1 text-[11px] text-[#666666]">
            JPG / PNG · min 1200×600px · 300 DPI · max 5 MB
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png"
          multiple
          className="sr-only"
          aria-hidden="true"
          onChange={onInputChange}
        />
      </div>

      {/* Uploaded creatives grid */}
      {assets.length > 0 && (
        <section aria-label="Uploaded creatives">
          <p className="mb-3 text-[11px] font-bold tracking-[2.5px] text-[#666666] uppercase">
            Your Creatives ({assets.length})
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {assets.map((asset) => (
              <CreativeCard key={asset.id} asset={asset} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
