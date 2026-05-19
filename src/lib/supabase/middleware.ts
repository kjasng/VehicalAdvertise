import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

import type { Database } from '@/types/db'

export type SupabaseMiddlewareResult = {
  response: NextResponse
  userId: string | null
}

export async function updateSupabaseSession(
  request: NextRequest,
): Promise<SupabaseMiddlewareResult> {
  let response = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // Refresh session — must be called on every request per @supabase/ssr docs.
  const { data } = await supabase.auth.getUser()

  return { response, userId: data.user?.id ?? null }
}
