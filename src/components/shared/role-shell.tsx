/**
 * RoleShell — server component entrypoint.
 * Picks sidebar or bottom-nav variant based on the `nav` prop.
 *
 * Note: there is intentionally no visible bypass banner. The
 * `ADMIN_PANEL_BYPASS` env flag still works (admins can visit non-admin
 * panels in dev), but impersonation stays silent at the UI layer. The
 * underlying helpers live in `src/lib/auth/admin-bypass.ts` if a banner
 * needs to be reintroduced later.
 */
import type { ReactNode } from 'react'

import type { UserRole } from '@/types/db'

import type { BottomNavItem } from './role-bottom-nav'
import { RoleBottomNav } from './role-bottom-nav'
import type { NavItem } from './role-sidebar'
import { RoleSidebar } from './role-sidebar'
import { RoleTopbar } from './role-topbar'

interface RoleShellSidebarProps {
  nav: 'sidebar'
  navItems: NavItem[]
}

interface RoleShellBottomNavProps {
  nav: 'bottom-nav'
  navItems: BottomNavItem[]
}

type RoleShellProps = {
  role: UserRole
  brandLabel?: string
  pathname: string
  userEmail: string | null
  children: ReactNode
} & (RoleShellSidebarProps | RoleShellBottomNavProps)

export function RoleShell({
  role,
  nav,
  navItems,
  brandLabel,
  pathname,
  userEmail,
  children,
}: RoleShellProps) {
  if (nav === 'sidebar') {
    return (
      <div className="flex min-h-screen">
        <RoleSidebar
          role={role}
          navItems={navItems as NavItem[]}
          brandLabel={brandLabel}
          pathname={pathname}
          userEmail={userEmail}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    )
  }

  // bottom-nav variant (mobile driver layout)
  return (
    <div className="flex min-h-screen flex-col bg-[#f7f8fa]">
      <RoleTopbar brandLabel={brandLabel} userEmail={userEmail} />
      {/* pb-[80px] so content never hides behind the fixed bottom nav */}
      <main className="flex-1 px-4 pt-4 pb-[80px]">{children}</main>
      <RoleBottomNav items={navItems as BottomNavItem[]} pathname={pathname} />
    </div>
  )
}
