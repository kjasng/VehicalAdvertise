import { createBrowserClient } from '@supabase/ssr'

import type { Database } from '@/types/db'

import { getPublishableKey, getSupabaseUrl } from './env'

export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(getSupabaseUrl(), getPublishableKey())
}
