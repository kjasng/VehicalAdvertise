'use client'

/**
 * AdminSidebarNav — client component for the admin sidebar nav list.
 * Imports ADMIN_NAV directly (no props) so Lucide icons never cross the
 * server→client boundary. Uses usePathname() for correct active state on
 * every client-side navigation.
 */
import Link from 'next/link'
import { useState } from 'react'

import { ChevronRight } from 'lucide-react'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'

import { ADMIN_NAV } from './admin-nav-config'
import type { NavItem } from '@/components/shared/role-sidebar'

// ── Collapsible group (client, useState for toggle) ────────────────────────

function NavGroupItem({
  item,
  pathname,
}: {
  item: NavItem & { children: NavItem[] }
  pathname: string
}) {
  const Icon = item.icon
  const anyChildActive = item.children.some(
    (c) => c.href && (pathname === c.href || pathname.startsWith(c.href + '/')),
  )
  const [open, setOpen] = useState(anyChildActive)

  return (
    <li>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={cn(
          'flex w-full items-center gap-3 rounded px-4 py-2.5 text-[13px] font-semibold transition-colors duration-150',
          'focus-visible:ring-primary focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-[#1a1a1a] focus-visible:outline-none',
          anyChildActive ? 'text-white/90' : 'text-white/40 hover:bg-white/5 hover:text-white/70',
        )}
      >
        <Icon className="size-4 shrink-0" aria-hidden="true" />
        <span className="flex-1 text-left">{item.label}</span>
        <ChevronRight
          className={cn('size-3 transition-transform duration-150', open && 'rotate-90')}
          aria-hidden="true"
        />
      </button>

      {open && (
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
      )}
    </li>
  )
}

// ── Mobile nav strip (horizontal scroll, flattens groups) ─────────────────

export function AdminMobileNav() {
  const pathname = usePathname()

  const flatItems = ADMIN_NAV.flatMap((item) =>
    item.children?.length
      ? item.children.filter((c): c is NavItem & { href: string } => !!c.href)
      : item.href
        ? [item as NavItem & { href: string }]
        : [],
  )

  return (
    <nav
      className="sticky top-0 z-10 -mx-6 -mt-6 mb-6 overflow-x-auto bg-[#1a1a1a] px-4 py-2 md:hidden"
      aria-label="Admin mobile navigation"
    >
      <div className="flex gap-1 whitespace-nowrap">
        {flatItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={
              pathname === item.href || pathname.startsWith(item.href + '/') ? 'page' : undefined
            }
            className={cn(
              'rounded px-3 py-1.5 text-[12px] font-bold tracking-[0.5px] uppercase transition-colors',
              pathname === item.href || pathname.startsWith(item.href + '/')
                ? 'bg-white/15 text-white'
                : 'text-white/50 hover:bg-white/10 hover:text-white/80',
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}

// ── Main nav list ──────────────────────────────────────────────────────────

export function AdminSidebarNav() {
  const pathname = usePathname()

  return (
    <ul className="flex flex-col gap-0.5">
      {ADMIN_NAV.map((item) => {
        if (item.children?.length) {
          return (
            <NavGroupItem
              key={item.label}
              item={item as NavItem & { children: NavItem[] }}
              pathname={pathname}
            />
          )
        }
        if (!item.href) return null
        const active = pathname === item.href || pathname.startsWith(item.href + '/')
        const Icon = item.icon
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded px-4 py-3 text-[13px] font-medium transition-colors duration-150',
                'focus-visible:ring-primary focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-[#1a1a1a] focus-visible:outline-none',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-white/70 hover:bg-white/10 hover:text-white',
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              {item.label}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
