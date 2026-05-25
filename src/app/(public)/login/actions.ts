'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createSupabaseServerClient } from '@/lib/supabase/server'

/**
 * signOutAction — server action.
 * Invalidates the Supabase session, drops cached layouts (so cached
 * authenticated UI never leaks to the next visitor), then redirects to /login.
 * Used by RoleUserMenu and any other sign-out trigger.
 */
export async function signOutAction() {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
