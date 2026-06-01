/**
 * NavGroup — pure server component using native <details>/<summary>.
 * No 'use client' needed: toggle is browser-native, no icon serialization issue.
 * Auto-opens when a child route is active; collapsed by default otherwise.
 */
import Link from 'next/link'

import { ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'

import type { NavItem } from './role-sidebar'

interface NavGroupProps {
  item: NavItem & { children: NavItem[] }
  pathname: string
}

export function NavGroup({ item, pathname }: NavGroupProps) {
  const Icon = item.icon

  const anyChildActive = item.children.some(
    (c) => c.href && (pathname === c.href || pathname.startsWith(c.href + '/')),
  )

  return (
    <li>
      {/* group class enables Tailwind's group-open: variant on children */}
      <details open={anyChildActive || undefined} className="group">
        {/* list-none + -webkit-details-marker remove the default browser disclosure arrow */}
        <summary
          className={cn(
            'flex cursor-pointer list-none items-center gap-3 rounded px-4 py-2.5 text-[13px] font-semibold transition-colors duration-150 select-none',
            '[&::-webkit-details-marker]:hidden',
            'focus-visible:ring-primary focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-[#1a1a1a] focus-visible:outline-none',
            anyChildActive
              ? 'text-white/90 hover:bg-white/5'
              : 'text-white/40 hover:bg-white/5 hover:text-white/70',
          )}
        >
          <Icon className="size-4 shrink-0" aria-hidden="true" />
          <span className="flex-1">{item.label}</span>
          {/* Rotates 90° via group-open: when <details open> is set */}
          <ChevronRight
            className="size-3 transition-transform duration-150 group-open:rotate-90"
            aria-hidden="true"
          />
        </summary>

        <ul className="mb-1 ml-4 flex flex-col gap-0.5 border-l border-white/10 pl-2">
          {item.children.map((child) => {
            if (!child.href) return null
            const childActive = pathname === child.href || pathname.startsWith(child.href + '/')
            const ChildIcon = child.icon
            return (
              <li key={child.href}>
                <Link
                  href={child.href}
                  aria-current={childActive ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-2.5 rounded px-3 py-2 text-[12px] font-medium transition-colors duration-150',
                    'focus-visible:ring-primary focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-[#1a1a1a] focus-visible:outline-none',
                    childActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-white/60 hover:bg-white/10 hover:text-white',
                  )}
                >
                  <ChildIcon className="size-3.5 shrink-0" aria-hidden="true" />
                  {child.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </details>
    </li>
  )
}
