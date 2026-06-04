'use client'

/**
 * CampaignCreativeUpload — image-only uploader for the campaign wizard's
 * Creative step. Uploads each picked image to Supabase Storage via the
 * uploadCampaignCreative server action and stores the resulting public URLs in
 * the form field as a newline-joined string (the shape createPartnerCampaign
 * already expects). Replaces the old paste-a-URL textarea.
 */
import { useRef, useState } from 'react'

import { ImagePlus, Loader2, X } from 'lucide-react'
import { toast } from 'sonner'

import { uploadCampaignCreative } from '@/app/partner/campaigns/actions'
import { cn } from '@/lib/utils'

interface Props {
  value: string
  onChange: (value: string) => void
}

export function CampaignCreativeUpload({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const urls = value
    .split('\n')
    .map((u) => u.trim())
    .filter(Boolean)

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploading(true)
    const next = [...urls]
    for (const file of Array.from(files)) {
      const fd = new FormData()
      fd.append('file', file)
      const res = await uploadCampaignCreative(fd)
      if (res.error || !res.url) {
        toast.error(res.error ?? 'Upload failed')
        continue
      }
      next.push(res.url)
    }
    onChange(next.join('\n'))
    setUploading(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  function removeAt(index: number) {
    onChange(urls.filter((_, i) => i !== index).join('\n'))
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className={cn(
          'flex w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed border-[#cbccc9] bg-white px-4 py-8 text-center transition-colors',
          'hover:border-[#ff5c00] hover:bg-[#fff7f2] disabled:cursor-not-allowed disabled:opacity-60',
        )}
      >
        {uploading ? (
          <Loader2 className="size-6 animate-spin text-[#ff5c00]" aria-hidden="true" />
        ) : (
          <ImagePlus className="size-6 text-[#ff5c00]" aria-hidden="true" />
        )}
        <span className="text-sm font-bold text-[#1a1a1a]">
          {uploading ? 'Uploading…' : 'Upload creative images'}
        </span>
        <span className="text-[11px] text-[#666666]">
          PNG, JPG up to 8MB each. Pick one or more.
        </span>
      </button>

      {urls.length > 0 && (
        <ul className="grid grid-cols-3 gap-2">
          {urls.map((url, i) => (
            <li
              key={url}
              className="group relative aspect-square overflow-hidden rounded-md border border-[#cbccc9]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Creative ${i + 1}`} className="size-full object-cover" />
              <button
                type="button"
                onClick={() => removeAt(i)}
                aria-label={`Remove creative ${i + 1}`}
                className="absolute top-1 right-1 flex size-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
