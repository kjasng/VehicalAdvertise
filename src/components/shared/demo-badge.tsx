/**
 * DemoBadge — small chip rendered only when NODE_ENV !== 'production'.
 * Use beside KPI values, tables, or sections sourced from mock data so
 * demo numbers cannot be mistaken for live data.
 *
 * This is the canonical implementation; src/components/admin/demo-badge.tsx
 * keeps a re-export for backwards compatibility while admin pages migrate.
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
