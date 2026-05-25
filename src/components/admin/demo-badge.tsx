/**
 * DemoBadge — renders only in non-production environments.
 * Use next to KPI values or table headings sourced from mock data.
 */
export function DemoBadge() {
  if (process.env.NODE_ENV === 'production') return null

  return (
    <span
      aria-label="Demo data"
      className="bg-primary/10 text-primary inline-block rounded px-1.5 py-0.5 text-[10px] font-bold tracking-[1px] uppercase"
    >
      DEMO
    </span>
  )
}
