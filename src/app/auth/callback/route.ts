import { NextResponse, type NextRequest } from 'next/server'

import { sendWelcome } from '@/lib/email/send-notifications'
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

  // Send welcome email only for brand-new email signups.
  // We detect "new" by checking if created_at is within the last 2 minutes
  // (email confirmation typically happens within seconds of signup).
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user?.email && user.created_at) {
      const ageMs = Date.now() - new Date(user.created_at).getTime()
      if (ageMs < 2 * 60 * 1000) {
        const name = (user.user_metadata?.full_name as string | undefined) ?? user.email
        sendWelcome({ email: user.email, name }).catch(() => {})
      }
    }
  } catch {
    // Non-blocking — welcome email failure must never break auth flow
  }

  return NextResponse.redirect(`${origin}${next}`)
}
