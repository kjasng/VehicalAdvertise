/**
 * Admin layout — wraps all /admin/* pages with RoleShell sidebar.
 * Pathname read from x-pathname header injected by proxy middleware,
 * keeping this a pure server component with no client-side usePathname().
 * On mobile (<md), a sticky scrollable top strip replaces the hidden sidebar.
 */
import type { ReactNode } from 'react'

import { headers } from 'next/headers'
import Link from 'next/link'

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
      brandLabel="VehicalAdvertise"
    >
      {/* Mobile nav strip — hidden on md+ where sidebar takes over.
          Groups are flattened: children rendered inline, group header skipped. */}
      <nav
        className="sticky top-0 z-10 -mx-6 -mt-6 mb-6 overflow-x-auto bg-[#1a1a1a] px-4 py-2 md:hidden"
        aria-label="Admin mobile navigation"
      >
        <div className="flex gap-1 whitespace-nowrap">
          {ADMIN_NAV.flatMap((item) =>
            item.children?.length ? item.children.filter((c) => c.href) : item.href ? [item] : [],
          ).map((item) => (
            <Link
              key={item.href}
              href={item.href!}
              className={`rounded px-3 py-1.5 text-[12px] font-bold tracking-[0.5px] uppercase transition-colors ${
                pathname === item.href || pathname.startsWith(item.href + '/')
                  ? 'bg-white/15 text-white'
                  : 'text-white/50 hover:bg-white/10 hover:text-white/80'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      {children}
    </RoleShell>
  )
}
