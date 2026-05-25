/**
 * PageHeader — server component.
 * Standard top-of-page block used on every role panel page.
 * Matches the marketing kicker + Anton title + optional CTA pattern.
 */
import type { ReactNode } from 'react'

interface PageHeaderProps {
  /** Small label above the title (e.g. "OVERVIEW") */
  kicker: string
  /** Main page title — rendered in Anton/font-heading */
  title: ReactNode
  /** Optional CTA slot rendered on the right */
  cta?: ReactNode
}

export function PageHeader({ kicker, title, cta }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1.5">
        <p className="text-primary text-[13px] font-extrabold tracking-[1.5px] uppercase">
          {kicker}
        </p>
        <h1 className="font-heading text-[42px] leading-[0.95] text-[#1a1a1a] uppercase">
          {title}
        </h1>
      </div>
      {cta && <div className="shrink-0">{cta}</div>}
    </header>
  )
}
