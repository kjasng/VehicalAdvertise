import { NextResponse, type NextRequest } from 'next/server'

import { createSupabaseServerClient } from '@/lib/supabase/server'

/**
 * OAuth code-exchange handler.
 * Provider redirects here with ?code=...&next=/optional. We swap the code for a
 * session via the SSR-aware Supabase client (which writes cookies), then redirect
 * to `next` (default `/`). The proxy then routes the user into onboarding or
 * their role home based on the freshly-seeded profile.
 */
// Only same-origin relative paths are accepted as ?next= targets, to prevent
// open-redirect via the OAuth callback.
function safeNext(value: string | null): string {
  if (!value) return '/'
  if (!value.startsWith('/')) return '/'
  if (value.startsWith('//') || value.startsWith('/\\')) return '/'
  return value
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = safeNext(searchParams.get('next'))

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`)
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)
  }

  return NextResponse.redirect(`${origin}${next}`)
}
