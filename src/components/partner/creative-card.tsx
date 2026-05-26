/**
 * CreativeCard — grid tile for a single uploaded creative asset.
 * Shows thumbnail, name, spec pill, status badge.
 */
import { cn } from '@/lib/utils'

import type { CreativeAsset, CreativeStatus } from './mock-data'

const STATUS_STYLES: Record<CreativeStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-600',
}

// Spec compliance: approved if dpi >= 300 AND size in [1200x600]
function isSpecCompliant(asset: CreativeAsset): boolean {
  return asset.dpi >= 300 && asset.widthPx >= 1200 && asset.heightPx >= 600
}

interface CreativeCardProps {
  asset: CreativeAsset
}

export function CreativeCard({ asset }: CreativeCardProps) {
  const compliant = isSpecCompliant(asset)

  return (
    <article
      className="flex flex-col overflow-hidden rounded-md border border-[#cbccc9] bg-white"
      aria-label={`Creative: ${asset.name}`}
    >
      {/* Thumbnail */}
      <div className="relative aspect-[2/1] w-full overflow-hidden bg-[#f7f8fa]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={asset.imageUrl}
          alt={asset.name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>

      <div className="flex flex-col gap-2 p-4">
        {/* Name */}
        <p className="truncate font-mono text-[12px] text-[#1a1a1a]" title={asset.name}>
          {asset.name}
        </p>

        {/* Spec row */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#666666]">
            {asset.widthPx}×{asset.heightPx}px · {asset.dpi}dpi · {asset.fileSizeKb}KB
          </span>
        </div>

        {/* Badges row */}
        <div className="flex items-center gap-2">
          {/* Spec compliance pill */}
          <span
            className={cn(
              'rounded px-1.5 py-0.5 text-[11px] font-bold uppercase',
              compliant ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600',
            )}
            aria-label={compliant ? 'Spec compliant' : 'Spec non-compliant'}
          >
            {compliant ? 'Spec OK' : 'Spec FAIL'}
          </span>

          {/* Status pill */}
          <span
            className={cn(
              'rounded px-1.5 py-0.5 text-[11px] font-bold uppercase',
              STATUS_STYLES[asset.status],
            )}
          >
            {asset.status}
          </span>
        </div>

        {/* Upload date */}
        <p className="text-[11px] text-[#666666]">Uploaded {asset.uploadedAt}</p>
      </div>
    </article>
  )
}
