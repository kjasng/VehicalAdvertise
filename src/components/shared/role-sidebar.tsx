/**
 * RoleSidebar — server component.
 * Dark desktop sidebar: logo + role badge + nav list + user menu at bottom.
 * Pathname is passed as a prop from the layout (server component) so this
 * stays a pure server component with no usePathname() hook.
 */
import Link from 'next/link'

import { ChevronRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { UserRole } from '@/types/db'

import { RoleUserMenu } from './role-user-menu'

export interface NavItem {
  /** Omit `href` for group-header items that have `children`. */
  href?: string
  label: string
  icon: LucideIcon
  /** If present, item renders as an always-expanded group with indented children. */
  children?: NavItem[]
}

interface RoleSidebarProps {
  role: UserRole
  navItems: NavItem[]
  brandLabel?: string
  pathname: string
  userEmail: string | null
}

const ROLE_BADGE: Record<UserRole, string> = {
  admin: 'ADMIN',
  driver: 'DRIVER',
  partner: 'PARTNER',
  garage: 'GARAGE',
  pending: 'PENDING',
}

export function RoleSidebar({
  role,
  navItems,
  brandLabel = 'VehicalAdvertise',
  pathname,
  userEmail,
}: RoleSidebarProps) {
  return (
    <aside
      className="hidden h-screen w-[240px] shrink-0 flex-col bg-[#1a1a1a] md:flex"
      role="navigation"
      aria-label={`${ROLE_BADGE[role]} navigation`}
    >
      {/* Top: brand + role badge */}
      <div className="border-b border-white/10 px-5 py-5">
        <p className="font-heading text-primary text-[22px] leading-none">{brandLabel}</p>
        <p className="mt-1.5 text-[11px] font-bold tracking-[2.5px] text-white/40 uppercase">
          {ROLE_BADGE[role]}
        </p>
      </div>

      {/* Middle: nav items */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <ul className="flex flex-col gap-0.5">
          {navItems.map((item) => {
            const Icon = item.icon

            // ── Group with children ──────────────────────────────────────
            if (item.children?.length) {
              const groupActive = item.children.some(
                (c) => c.href && (pathname === c.href || pathname.startsWith(c.href + '/')),
              )
              return (
                <li key={item.label}>
                  {/* Group header — not a link */}
                  <div
                    className={cn(
                      'flex items-center gap-3 px-4 py-2.5 text-[13px] font-semibold',
                      groupActive ? 'text-white/90' : 'text-white/40',
                    )}
                    aria-label={`${item.label} group`}
                  >
                    <Icon className="size-4 shrink-0" aria-hidden="true" />
                    <span className="flex-1">{item.label}</span>
                    <ChevronRight
                      className={cn('size-3 transition-transform', groupActive && 'rotate-90')}
                      aria-hidden="true"
                    />
                  </div>
                  {/* Children — always visible, indented */}
                  <ul className="mb-1 ml-4 flex flex-col gap-0.5 border-l border-white/10 pl-2">
                    {item.children.map((child) => {
                      if (!child.href) return null
                      const childActive =
                        pathname === child.href || pathname.startsWith(child.href + '/')
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
                </li>
              )
            }

            // ── Regular leaf link ────────────────────────────────────────
            if (!item.href) return null
            const active = pathname === item.href || pathname.startsWith(item.href + '/')
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
      </nav>

      {/* Bottom: user menu */}
      <div className="border-t border-white/10 px-4 py-4">
        <RoleUserMenu email={userEmail} />
      </div>
    </aside>
  )
}
