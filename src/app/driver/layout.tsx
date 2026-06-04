/**
 * Driver layout — wraps all /driver/* pages with RoleShell sidebar.
 * Desktop pencil shell: 240px dark sidebar + scrollable content area.
 * Nav uses a small client island so active state stays correct on
 * client-side transitions.
 */
import type { ReactNode } from 'react'

import { DRIVER_NAV } from '@/components/driver/driver-nav-config'
import { RoleShell } from '@/components/shared/role-shell'
import { RoleMobileNav, RoleSidebarNav } from '@/components/shared/role-sidebar-nav'
import { requireRole } from '@/lib/auth/role-gate'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export default async function DriverLayout({ children }: { children: ReactNode }) {
  await requireRole('driver')

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <RoleShell
      role="driver"
      nav="sidebar"
      navItems={DRIVER_NAV}
      navContent={<RoleSidebarNav role="driver" />}
      pathname="/driver"
      userEmail={user?.email ?? null}
      profileHref="/driver/profile"
      brandLabel="VehicalAdvertise"
    >
      <RoleMobileNav role="driver" />
      {children}
    </RoleShell>
  )
}
