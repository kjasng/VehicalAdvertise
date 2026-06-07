'use server'

import { redirect } from 'next/navigation'

import { homeForRole } from '@/lib/auth/role-gate'
import { createSupabaseServerClient } from '@/lib/supabase/server'

import type { UserRole } from '@/types/db-aliases'

// Garage is handled manually by admin — not self-assignable
const SELF_ASSIGNABLE: UserRole[] = ['driver', 'partner']

export async function chooseRoleAction(formData: FormData) {
  const target = formData.get('role')
  if (typeof target !== 'string' || !SELF_ASSIGNABLE.includes(target as UserRole)) {
    return { error: 'Invalid role' }
  }

  const supabase = await createSupabaseServerClient()

  // Surface anon callers with a friendly message instead of the RPC's
  // generic exception text.
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase.rpc('choose_role', {
    target: target as UserRole,
  })

  if (error) {
    // Don't leak raw Postgres exception text to the client.
    return { error: 'Could not set role. Please try again.' }
  }

  const role = data?.role ?? (target as UserRole)
  redirect(homeForRole(role))
}
