/**
 * Server-side role helpers backing the proxy and route handlers.
 *
 * - `getProfileRole(userId)` reads `profiles.role` + `blocked` via the
 *   service-role client (middleware can't rely on RLS-scoped session client).
 * - `requireRole(role)` for use inside server components / route handlers;
 *   throws a Next redirect-friendly Response if mismatched. Honors the
 *   ADMIN_PANEL_BYPASS env flag so admins can inspect other panels in dev.
 */
import 'server-only'

import { redirect } from 'next/navigation'

import { canAdminBypassPath } from '@/lib/auth/admin-bypass'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'

import type { UserRole } from '@/types/db-aliases'

export async function getProfileRole(userId: string): Promise<UserRole | null> {
  const admin = createSupabaseAdminClient()
  const { data, error } = await admin
    .from('profiles')
    .select('role, blocked')
    .eq('id', userId)
    .maybeSingle<{ role: UserRole; blocked: boolean }>()

  if (error || !data || data.blocked) return null
  return data.role
}

/** Fetches role + kyc_status (+ partnerStatus for partner role) for the proxy middleware. */
export async function getProfileData(userId: string): Promise<{
  role: UserRole
  kycStatus: string
  blocked: boolean
  partnerStatus?: string | null
} | null> {
  const admin = createSupabaseAdminClient()
  const { data, error } = await admin
    .from('profiles')
    .select('role, kyc_status, blocked')
    .eq('id', userId)
    .maybeSingle()

  if (error || !data) return null
  if (data.blocked) {
    return {
      role: data.role as UserRole,
      kycStatus: data.kyc_status,
      blocked: true,
    }
  }

  // For partners, fetch approval status in a second query (only on partner routes)
  if (data.role === 'partner') {
    const { data: partnerRow } = await admin
      .from('partners')
      .select('status')
      .eq('id', userId)
      .maybeSingle()
    return {
      role: data.role as UserRole,
      kycStatus: data.kyc_status,
      blocked: false,
      partnerStatus: partnerRow?.status ?? null,
    }
  }

  return { role: data.role as UserRole, kycStatus: data.kyc_status, blocked: false }
}

export async function getCurrentUserRole(): Promise<UserRole | null> {
  const supabase = await createSupabaseServerClient()
  const { data: userData } = await supabase.auth.getUser()
  const userId = userData?.user?.id
  if (!userId) return null
  return getProfileRole(userId)
}

/**
 * requireRole — honors admin bypass when the flag is on.
 * For server components and route handlers that gate a single role.
 * If the user is an admin bypassing into another panel, we allow access
 * instead of redirecting.
 */
export async function requireRole(role: UserRole): Promise<UserRole> {
  const current = await getCurrentUserRole()
  if (current === role) return current
  // Allow admin to view non-admin panels when bypass flag is on.
  // canAdminBypassPath only returns true when profileRole === 'admin' (non-null),
  // so the non-null assertion below is safe.
  if (canAdminBypassPath(current, role as Exclude<UserRole, 'pending'>)) {
    return current! // profileRole is 'admin' when bypass is true; cannot be null
  }
  redirect('/login')
}

const GATED_PREFIXES: Record<Exclude<UserRole, 'pending'>, string> = {
  driver: '/driver',
  partner: '/partner',
  admin: '/admin',
  garage: '/garage',
}

const ONBOARDING_ALLOWLIST = [
  '/',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/onboarding',
  '/auth/callback',
]

export function pathRequiresRole(pathname: string): Exclude<UserRole, 'pending'> | null {
  for (const role of Object.keys(GATED_PREFIXES) as Array<keyof typeof GATED_PREFIXES>) {
    if (pathname.startsWith(GATED_PREFIXES[role])) return role
  }
  return null
}

export function pathAllowedForPending(pathname: string): boolean {
  return ONBOARDING_ALLOWLIST.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

export function homeForRole(role: UserRole | null): string {
  if (!role) return '/login'
  if (role === 'pending') return '/onboarding'
  return GATED_PREFIXES[role] + '/dashboard'
}
