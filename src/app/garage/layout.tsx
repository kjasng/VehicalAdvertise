/**
 * Garage layout — wraps all /garage/* pages with RoleShell sidebar.
 * Nav uses a small client island so active state stays correct on
 * client-side transitions.
 */
import type { ReactNode } from 'react'

import { GARAGE_NAV } from '@/components/garage/garage-nav-config'
import { RoleShell } from '@/components/shared/role-shell'
import { RoleMobileNav, RoleSidebarNav } from '@/components/shared/role-sidebar-nav'
import { requireRole } from '@/lib/auth/role-gate'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export default async function GarageLayout({ children }: { children: ReactNode }) {
  await requireRole('garage')

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <RoleShell
      role="garage"
      nav="sidebar"
      navItems={GARAGE_NAV}
      navContent={<RoleSidebarNav role="garage" />}
      pathname="/garage"
      userEmail={user?.email ?? null}
      brandLabel="VehicalAdvertise"
    >
      <RoleMobileNav role="garage" />
      {children}
    </RoleShell>
  )
}
