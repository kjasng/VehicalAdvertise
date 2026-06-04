'use client'

import Link from 'next/link'
import { useState } from 'react'

import { ChevronRight } from 'lucide-react'
import { usePathname } from 'next/navigation'

import { DRIVER_NAV } from '@/components/driver/driver-nav-config'
import { GARAGE_NAV } from '@/components/garage/garage-nav-config'
import { PARTNER_NAV } from '@/components/partner/partner-nav-config'
import { cn } from '@/lib/utils'

import type { NavItem } from './role-sidebar'

type RoleNavKey = 'driver' | 'partner' | 'garage'

const NAV_BY_ROLE: Record<RoleNavKey, NavItem[]> = {
  driver: DRIVER_NAV,
  partner: PARTNER_NAV,
  garage: GARAGE_NAV,
}

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

function NavGroupItem({
  item,
  pathname,
}: {
  item: NavItem & { children: NavItem[] }
  pathname: string
}) {
  const Icon = item.icon
  const anyChildActive = item.children.some((child) => child.href && isActive(pathname, child.href))
  const [open, setOpen] = useState(anyChildActive)

  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
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
            const active = isActive(pathname, child.href)
            const ChildIcon = child.icon

            return (
              <li key={child.href}>
                <Link
                  href={child.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-2.5 rounded px-3 py-2 text-[12px] font-medium transition-colors duration-150',
                    'focus-visible:ring-primary focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-[#1a1a1a] focus-visible:outline-none',
                    active
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

function flatNavItems(items: NavItem[]) {
  return items.flatMap((item) =>
    item.children?.length
      ? item.children.filter((child): child is NavItem & { href: string } => Boolean(child.href))
      : item.href
        ? [item as NavItem & { href: string }]
        : [],
  )
}

export function RoleSidebarNav({ role }: { role: RoleNavKey }) {
  const pathname = usePathname()
  const items = NAV_BY_ROLE[role]

  return (
    <ul className="flex flex-col gap-0.5">
      {items.map((item) => {
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

        const active = isActive(pathname, item.href)
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

export function RoleMobileNav({ role }: { role: RoleNavKey }) {
  const pathname = usePathname()
  const items = flatNavItems(NAV_BY_ROLE[role])

  return (
    <nav
      className="sticky top-0 z-10 -mx-6 -mt-6 mb-6 overflow-x-auto bg-[#1a1a1a] px-4 py-2 md:hidden"
      aria-label={`${role} mobile navigation`}
    >
      <div className="flex gap-1 whitespace-nowrap">
        {items.map((item) => {
          const active = isActive(pathname, item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'rounded px-3 py-1.5 text-[12px] font-bold tracking-[0.5px] uppercase transition-colors',
                active
                  ? 'bg-white/15 text-white'
                  : 'text-white/50 hover:bg-white/10 hover:text-white/80',
              )}
            >
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
