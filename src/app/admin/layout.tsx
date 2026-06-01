/**
 * Admin layout — wraps all /admin/* pages with RoleShell sidebar.
 * Nav uses client components (AdminSidebarNav, AdminMobileNav) so active
 * state updates correctly on every client-side navigation via usePathname().
 */
import type { ReactNode } from 'react'

import { AdminMobileNav, AdminSidebarNav } from '@/components/admin/admin-sidebar-nav'
import { ADMIN_NAV } from '@/components/admin/admin-nav-config'
import { RoleShell } from '@/components/shared/role-shell'
import { requireRole } from '@/lib/auth/role-gate'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireRole('admin')

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <RoleShell
      role="admin"
      nav="sidebar"
      navItems={ADMIN_NAV}
      navContent={<AdminSidebarNav />}
      pathname="/admin"
      userEmail={user?.email ?? null}
      brandLabel="VehicalAdvertise"
    >
      {/* Mobile nav — client component so usePathname() stays current */}
      <AdminMobileNav />

      {children}
    </RoleShell>
  )
}
