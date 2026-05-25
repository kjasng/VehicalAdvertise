/**
 * SectionShell — server component.
 * Bordered container that replaces shadcn Card in role panel dashboards.
 * Light variant: white bg + border #cbccc9.
 * Dark variant: #1a1a1a bg + border white/10.
 */
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface SectionShellProps {
  title?: string
  /** Optional action slot rendered on the right of the title row */
  action?: ReactNode
  children: ReactNode
  variant?: 'light' | 'dark'
  className?: string
}

export function SectionShell({
  title,
  action,
  children,
  variant = 'light',
  className,
}: SectionShellProps) {
  const isDark = variant === 'dark'

  return (
    <section
      className={cn(
        'rounded-md border',
        isDark ? 'border-white/10 bg-[#1a1a1a]' : 'border-[#cbccc9] bg-white',
        className,
      )}
    >
      {(title || action) && (
        <div
          className={cn(
            'flex items-center justify-between border-b px-5 py-4',
            isDark ? 'border-white/10' : 'border-[#cbccc9]',
          )}
        >
          {title && (
            <h2
              className={cn(
                'font-heading text-[24px] leading-none uppercase',
                isDark ? 'text-white' : 'text-[#1a1a1a]',
              )}
            >
              {title}
            </h2>
          )}
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  )
}
