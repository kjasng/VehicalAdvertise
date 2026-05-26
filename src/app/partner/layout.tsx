/**
 * Partner layout — wraps all /partner/* pages with RoleShell sidebar.
 * Pathname read from x-pathname header injected by proxy middleware,
 * keeping this a pure server component with no client-side usePathname().
 */
import type { ReactNode } from 'react'

import { headers } from 'next/headers'

import { PARTNER_NAV } from '@/components/partner/partner-nav-config'
import { RoleShell } from '@/components/shared/role-shell'
import { requireRole } from '@/lib/auth/role-gate'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export default async function PartnerLayout({ children }: { children: ReactNode }) {
  await requireRole('partner')

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const headersList = await headers()
  const pathname = headersList.get('x-pathname') ?? '/partner/dashboard'

  return (
    <RoleShell
      role="partner"
      nav="sidebar"
      navItems={PARTNER_NAV}
      pathname={pathname}
      userEmail={user?.email ?? null}
      brandLabel="VehicalAdvertise"
    >
      {children}
    </RoleShell>
  )
}
