/**
 * Server-only. Never import from a client component or any file under "use client".
 *
 * Uses the SUPABASE_SERVICE_ROLE_KEY to bypass RLS for privileged writes
 * (state transitions, GPS ingest, ledger entries, payouts). Every callsite
 * must enforce its own authz check before calling.
 */
import 'server-only'

import { createClient } from '@supabase/supabase-js'

import type { Database } from '@/types/db'

export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error(
      'createSupabaseAdminClient: missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY',
    )
  }

  return createClient<Database>(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
