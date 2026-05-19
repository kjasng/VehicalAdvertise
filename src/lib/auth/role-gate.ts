/**
 * Server-side role helpers backing the proxy and route handlers.
 *
 * - `getProfileRole(userId)` reads `profiles.role` via the service-role client
 *   (lookups during middleware can't rely on RLS-scoped session client).
 * - `requireRole(role)` for use inside server components / route handlers;
 *   throws a Next redirect-friendly Response if mismatched.
 */
import 'server-only'

import { redirect } from 'next/navigation'

import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'

import type { UserRole } from '@/types/db'

export async function getProfileRole(userId: string): Promise<UserRole | null> {
  const admin = createSupabaseAdminClient()
  const { data, error } = await admin
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle<{ role: UserRole }>()

  if (error || !data) return null
  return data.role
}

export async function getCurrentUserRole(): Promise<UserRole | null> {
  const supabase = await createSupabaseServerClient()
  const { data: userData } = await supabase.auth.getUser()
  const userId = userData?.user?.id
  if (!userId) return null
  return getProfileRole(userId)
}

export async function requireRole(role: UserRole): Promise<UserRole> {
  const current = await getCurrentUserRole()
  if (current !== role) {
    redirect('/login')
  }
  return current
}

const ROLE_PREFIX: Record<UserRole, string> = {
  driver: '/driver',
  partner: '/partner',
  admin: '/admin',
  garage: '/garage',
}

export function pathRequiresRole(pathname: string): UserRole | null {
  for (const role of Object.keys(ROLE_PREFIX) as UserRole[]) {
    if (pathname.startsWith(ROLE_PREFIX[role])) return role
  }
  return null
}

export function homeForRole(role: UserRole | null): string {
  if (!role) return '/login'
  return ROLE_PREFIX[role]
}
