import { NextResponse, type NextRequest } from 'next/server'

import { getProfileRole, pathRequiresRole } from '@/lib/auth/role-gate'
import { updateSupabaseSession } from '@/lib/supabase/middleware'

export async function proxy(request: NextRequest) {
  const { response, userId } = await updateSupabaseSession(request)

  const requiredRole = pathRequiresRole(request.nextUrl.pathname)
  if (!requiredRole) return response

  if (!userId) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const role = await getProfileRole(userId)
  if (role !== requiredRole) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif)$).*)',
  ],
}
