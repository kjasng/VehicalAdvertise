/**
 * EmptyState — server component.
 * Pencil-styled placeholder: kicker + Anton h2 + helper copy + optional CTA.
 * Replaces PlaceholderCard. Same broad API so callers can switch with minimal
 * churn. PlaceholderCard re-export is kept in role-nav.tsx for phases 03-06
 * backwards compat; removed in phase 07.
 */
import type { ReactNode } from 'react'

interface EmptyStateProps {
  /** Small label above the heading (e.g. "NO RESULTS") */
  kicker: string
  /** Main heading */
  title: string
  /** Supporting copy */
  helper: string
  /** Optional CTA button/link */
  cta?: ReactNode
}

export function EmptyState({ kicker, title, helper, cta }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 rounded-md border border-[#cbccc9] bg-white px-8 py-16 text-center">
      <p className="text-primary text-[11px] font-bold tracking-[2.5px] uppercase">{kicker}</p>
      <h2 className="font-heading text-[36px] leading-[0.95] text-[#1a1a1a] uppercase">{title}</h2>
      <p className="max-w-sm text-sm leading-[1.5] text-[#666666]">{helper}</p>
      {cta && <div>{cta}</div>}
    </div>
  )
}
