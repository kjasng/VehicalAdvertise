import { NextResponse, type NextRequest } from 'next/server'

import { canAdminBypassPath } from '@/lib/auth/admin-bypass'
import { getProfileData, pathAllowedForPending, pathRequiresRole } from '@/lib/auth/role-gate'
import { updateSupabaseSession } from '@/lib/supabase/middleware'

// ADMIN_PANEL_BYPASS feature flag:
// When process.env.ADMIN_PANEL_BYPASS === "true", admins skip the role-redirect
// for /driver, /partner, and /garage routes — letting them inspect other panels.
// To disable in production: delete the env var from Vercel (or .env.local).
// Non-admin users are NEVER affected regardless of flag state.

export async function proxy(request: NextRequest) {
  const { response, userId } = await updateSupabaseSession(request)
  const { pathname } = request.nextUrl

  // Inject x-pathname so server layouts can read the current path without
  // needing a client-side usePathname() hook.
  response.headers.set('x-pathname', pathname)

  const requiredRole = pathRequiresRole(pathname)

  // Onboarding-specific gate: signed-in pending users must finish onboarding before
  // any other route except the allowlist (landing, login, onboarding, callback).
  if (userId && !pathAllowedForPending(pathname)) {
    const profile = await getProfileData(userId)
    const role = profile?.role ?? null

    if (profile?.blocked) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    if (role === 'pending') {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }

    // KYC gate: drivers without an approved KYC can only access /driver/verify.
    if (
      role === 'driver' &&
      profile?.kycStatus !== 'approved' &&
      !pathname.startsWith('/driver/verify')
    ) {
      return NextResponse.redirect(new URL('/driver/verify', request.url))
    }

    // Partner gate: partners without an approved profile can only access /partner/onboarding.
    if (
      role === 'partner' &&
      profile?.partnerStatus !== 'approved' &&
      !pathname.startsWith('/partner/onboarding')
    ) {
      return NextResponse.redirect(new URL('/partner/onboarding', request.url))
    }

    if (requiredRole && role !== requiredRole) {
      // Admin bypass: allow an admin to visit non-admin role paths when flag is on.
      if (canAdminBypassPath(role, requiredRole)) return response
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return response
  }

  if (requiredRole) {
    if (!userId) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    const profile = await getProfileData(userId)
    const role = profile?.role ?? null
    if (profile?.blocked) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    if (role !== requiredRole) {
      // Admin bypass: allow an admin to visit non-admin role paths when flag is on.
      if (canAdminBypassPath(role, requiredRole)) return response
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return response
}

// Next.js 16 `proxy.ts` always runs on Node.js, so the service-role client
// inside getProfileRole is safe to call here. (Edge runtime is rejected by
// the framework at build time.)
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif)$).*)',
  ],
}
