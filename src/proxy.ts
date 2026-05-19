import { NextResponse, type NextRequest } from 'next/server'

import { getProfileRole, pathAllowedForPending, pathRequiresRole } from '@/lib/auth/role-gate'
import { updateSupabaseSession } from '@/lib/supabase/middleware'

export async function proxy(request: NextRequest) {
  const { response, userId } = await updateSupabaseSession(request)
  const { pathname } = request.nextUrl

  const requiredRole = pathRequiresRole(pathname)

  // Onboarding-specific gate: signed-in pending users must finish onboarding before
  // any other route except the allowlist (landing, login, onboarding, callback).
  if (userId && !pathAllowedForPending(pathname)) {
    const role = await getProfileRole(userId)
    if (role === 'pending') {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }
    if (requiredRole && role !== requiredRole) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return response
  }

  if (requiredRole) {
    if (!userId) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    const role = await getProfileRole(userId)
    if (role !== requiredRole) {
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
