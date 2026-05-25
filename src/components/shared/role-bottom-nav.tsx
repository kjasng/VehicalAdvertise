/**
 * RoleBottomNav — server component.
 * Fixed bottom tab bar for mobile (driver panel).
 * Pathname passed as prop to keep this a server component.
 */
import Link from 'next/link'

import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

export interface BottomNavItem {
  href: string
  label: string
  icon: LucideIcon
}

interface RoleBottomNavProps {
  items: BottomNavItem[]
  pathname: string
}

export function RoleBottomNav({ items, pathname }: RoleBottomNavProps) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 h-[64px] border-t border-white/10 bg-[#1a1a1a]"
      role="navigation"
      aria-label="Main navigation"
      style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}
    >
      <ul className="grid h-full" style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}>
        {items.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <li key={item.href} className="flex">
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative flex flex-1 flex-col items-center justify-center gap-1 transition-colors duration-150',
                  'focus-visible:ring-primary focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset',
                  active ? 'text-primary' : 'text-white/50 hover:text-white/80',
                )}
              >
                {/* Active top-border accent */}
                {active && (
                  <span
                    className="bg-primary absolute inset-x-0 top-0 h-[2px]"
                    aria-hidden="true"
                  />
                )}
                <Icon className="size-5 shrink-0" aria-hidden="true" />
                <span className="text-[10px] font-bold tracking-[1px] uppercase">{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
