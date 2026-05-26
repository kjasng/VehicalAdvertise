/**
 * Driver layout — wraps all /driver/* pages with RoleShell bottom-nav.
 * Mobile-first PWA: 4-tab bottom nav, content padded pb-[80px] by RoleShell.
 * Pathname read from x-pathname header injected by proxy middleware.
 */
import type { ReactNode } from 'react'

import { headers } from 'next/headers'

import { DRIVER_NAV } from '@/components/driver/driver-nav-config'
import { RoleShell } from '@/components/shared/role-shell'
import { requireRole } from '@/lib/auth/role-gate'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export default async function DriverLayout({ children }: { children: ReactNode }) {
  await requireRole('driver')

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const headersList = await headers()
  const pathname = headersList.get('x-pathname') ?? '/driver/dashboard'

  return (
    <RoleShell
      role="driver"
      nav="bottom-nav"
      navItems={DRIVER_NAV}
      pathname={pathname}
      userEmail={user?.email ?? null}
    >
      {children}
    </RoleShell>
  )
}
