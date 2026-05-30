import 'server-only'

import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export type AdminUserRow = {
  id: string
  email: string | null
  fullName: string
  role: string
  kycStatus: string
  joinedAt: string
  blocked: boolean
}

export async function getUsers(search?: string): Promise<AdminUserRow[]> {
  const supabase = createSupabaseAdminClient()

  let query = supabase
    .from('profiles')
    .select('id, email, full_name, role, kyc_status, blocked, created_at')
    .order('created_at', { ascending: false })
    .limit(200)

  if (search?.trim()) {
    // Strip PostgREST filter meta-characters to prevent filter-string injection.
    // Comma, parens, dot, and quote characters are used as separators/operators
    // in the .or() filter expression and must not be passed through raw.
    const sanitized = search.trim().replace(/[(),.'"\\%_]/g, '')
    if (sanitized) {
      const term = `%${sanitized}%`
      query = query.or(`full_name.ilike.${term},email.ilike.${term}`)
    }
  }

  const { data, error } = await query
  if (error || !data) return []

  return data.map((p) => ({
    id: p.id,
    email: p.email,
    fullName: p.full_name,
    role: p.role,
    kycStatus: p.kyc_status,
    joinedAt: p.created_at,
    blocked: p.blocked,
  }))
}
