'use server'

import { redirect } from 'next/navigation'

import { homeForRole } from '@/lib/auth/role-gate'
import { createSupabaseServerClient } from '@/lib/supabase/server'

import type { UserRole } from '@/types/db'

const SELF_ASSIGNABLE: UserRole[] = ['driver', 'partner', 'garage']

export async function chooseRoleAction(formData: FormData) {
  const target = formData.get('role')
  if (typeof target !== 'string' || !SELF_ASSIGNABLE.includes(target as UserRole)) {
    return { error: 'Invalid role' }
  }

  const supabase = await createSupabaseServerClient()
  // Cast through unknown: the placeholder Database type doesn't model RPCs
  // until `supabase gen types` runs against the linked project. Tighten this
  // by re-running codegen once Supabase is provisioned.
  const { data, error } = await (
    supabase.rpc as unknown as (
      name: string,
      args: Record<string, unknown>,
    ) => Promise<{ data: { role: UserRole } | null; error: { message: string } | null }>
  )('choose_role', { target: target as UserRole })

  if (error) {
    // Don't leak raw Postgres exception text to the client.
    return { error: 'Could not set role. Please try again.' }
  }

  const role = data?.role ?? (target as UserRole)
  redirect(homeForRole(role))
}
