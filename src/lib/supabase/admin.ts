/**
 * Server-only. Never import from a client component or any file under "use client".
 *
 * Uses the Supabase secret key (legacy name: service_role) to bypass RLS for
 * privileged writes (state transitions, GPS ingest, ledger entries, payouts).
 * Every callsite must enforce its own authz check before calling.
 */
import 'server-only'

import { createClient } from '@supabase/supabase-js'

import type { Database } from '@/types/db'

import { getSecretKey, getSupabaseUrl } from './env'

export function createSupabaseAdminClient() {
  return createClient<Database>(getSupabaseUrl(), getSecretKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
