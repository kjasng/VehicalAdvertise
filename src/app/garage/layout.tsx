/**
 * Garage layout — wraps all /garage/* pages with RoleShell sidebar.
 * Pathname read from x-pathname header injected by proxy middleware,
 * keeping this a pure server component with no client-side usePathname().
 */
import type { ReactNode } from 'react'

import { headers } from 'next/headers'

import { GARAGE_NAV } from '@/components/garage/garage-nav-config'
import { RoleShell } from '@/components/shared/role-shell'
import { requireRole } from '@/lib/auth/role-gate'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export default async function GarageLayout({ children }: { children: ReactNode }) {
  await requireRole('garage')

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const headersList = await headers()
  const pathname = headersList.get('x-pathname') ?? '/garage/dashboard'

  return (
    <RoleShell
      role="garage"
      nav="sidebar"
      navItems={GARAGE_NAV}
      pathname={pathname}
      userEmail={user?.email ?? null}
      brandLabel="VehicalAdvertise"
    >
      {children}
    </RoleShell>
  )
}
