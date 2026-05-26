/**
 * RoleTopbar — server component.
 * h-[64px] bar used in bottom-nav layouts (mobile driver panel) and
 * optionally as a supplemental top bar in sidebar layouts.
 * Slots: page title (left), user menu (right).
 * No bypass banner is rendered alongside — see role-shell.tsx for rationale.
 */
import type { ReactNode } from 'react'

import { RoleUserMenu } from './role-user-menu'

interface RoleTopbarProps {
  /** Brand or page title shown on the left */
  title?: ReactNode
  /** Brand wordmark fallback when title is omitted */
  brandLabel?: string
  userEmail: string | null
}

export function RoleTopbar({ title, brandLabel = 'VehicalAdvertise', userEmail }: RoleTopbarProps) {
  return (
    <header className="flex h-[64px] shrink-0 items-center justify-between border-b border-white/10 bg-[#1a1a1a] px-6">
      {/* Left */}
      <div className="flex min-w-0 items-center gap-3">
        {title ? (
          <span className="font-heading truncate text-[20px] leading-none text-white">{title}</span>
        ) : (
          <span className="font-heading text-primary text-[20px] leading-none">{brandLabel}</span>
        )}
      </div>

      {/* Right: user menu */}
      <RoleUserMenu email={userEmail} />
    </header>
  )
}
