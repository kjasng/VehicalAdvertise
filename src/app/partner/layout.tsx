/**
 * Partner layout — wraps all /partner/* pages with RoleShell sidebar.
 * Nav uses a small client island so active state stays correct on
 * client-side transitions.
 */
import type { ReactNode } from 'react'

import { PARTNER_NAV } from '@/components/partner/partner-nav-config'
import { RoleShell } from '@/components/shared/role-shell'
import { RoleMobileNav, RoleSidebarNav } from '@/components/shared/role-sidebar-nav'
import { requireRole } from '@/lib/auth/role-gate'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export default async function PartnerLayout({ children }: { children: ReactNode }) {
  await requireRole('partner')

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <RoleShell
      role="partner"
      nav="sidebar"
      navItems={PARTNER_NAV}
      navContent={<RoleSidebarNav role="partner" />}
      pathname="/partner"
      userEmail={user?.email ?? null}
      brandLabel="VehicalAdvertise"
    >
      <RoleMobileNav role="partner" />
      {children}
    </RoleShell>
  )
}
