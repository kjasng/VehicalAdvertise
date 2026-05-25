/**
 * KpiCard — server component.
 * Big-number dashboard card: Anton numeral, label, optional delta badge.
 */
import { cn } from '@/lib/utils'

interface KpiCardProps {
  label: string
  value: string | number
  /** Optional delta value, e.g. "12.4" */
  delta?: string | number
  deltaDirection?: 'up' | 'down'
  /** Unit appended to delta, e.g. "%" */
  deltaUnit?: string
}

export function KpiCard({ label, value, delta, deltaDirection, deltaUnit = '%' }: KpiCardProps) {
  const hasDelta = delta !== undefined && delta !== null

  return (
    <article className="flex flex-col gap-3 rounded-md border border-[#cbccc9] bg-white p-4">
      {/* Big numeral */}
      <p className="font-heading text-[48px] leading-none text-[#1a1a1a]">{value}</p>

      {/* Label + delta row */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-bold tracking-[1.5px] text-[#666666] uppercase">{label}</p>

        {hasDelta && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[11px] font-bold',
              deltaDirection === 'up'
                ? 'bg-green-100 text-green-700'
                : deltaDirection === 'down'
                  ? 'bg-red-100 text-red-600'
                  : 'bg-[#f0f0ee] text-[#666666]',
            )}
            aria-label={`${deltaDirection === 'up' ? 'Up' : 'Down'} ${delta}${deltaUnit}`}
          >
            {deltaDirection === 'up' ? '▲' : deltaDirection === 'down' ? '▼' : ''}
            {delta}
            {deltaUnit}
          </span>
        )}
      </div>
    </article>
  )
}
