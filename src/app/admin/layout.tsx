/**
 * Admin layout — wraps all /admin/* pages with RoleShell sidebar.
 * Pathname read from x-pathname header injected by proxy middleware,
 * keeping this a pure server component with no client-side usePathname().
 */
import type { ReactNode } from 'react'

import { headers } from 'next/headers'

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

  const headersList = await headers()
  const pathname = headersList.get('x-pathname') ?? '/admin/dashboard'

  return (
    <RoleShell
      role="admin"
      nav="sidebar"
      navItems={ADMIN_NAV}
      pathname={pathname}
      userEmail={user?.email ?? null}
      brandLabel="VehicalAdvertise · Admin"
    >
      {children}
    </RoleShell>
  )
}
