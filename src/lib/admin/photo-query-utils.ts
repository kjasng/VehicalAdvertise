import 'server-only'

import { createSupabaseAdminClient } from '@/lib/supabase/admin'

const SIGNED_URL_TTL_S = 900

export async function batchSignUrls(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  paths: string[],
): Promise<Record<string, string>> {
  if (!paths.length) return {}
  const { data, error } = await supabase.storage
    .from('driver-kyc')
    .createSignedUrls(paths, SIGNED_URL_TTL_S)
  if (error) console.error('[photo-query-utils] createSignedUrls error:', error.message)
  return Object.fromEntries(
    (data ?? [])
      .filter((signed) => signed.signedUrl)
      .map((signed) => [signed.path, signed.signedUrl]),
  )
}
