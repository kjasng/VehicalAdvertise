import 'server-only'

import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export type AdminUserRow = {
  id: string
  email: string | null
  fullName: string
  phone: string | null
  role: string
  kycStatus: string
  joinedAt: string
  blocked: boolean
}

export interface UserFilters {
  search?: string
  role?: string // empty = all roles
  status?: string // 'active' | 'suspended' | '' = all
}

export async function getUsers(filters: UserFilters = {}): Promise<AdminUserRow[]> {
  const supabase = createSupabaseAdminClient()
  const { search, role, status } = filters

  let query = supabase
    .from('profiles')
    .select('id, email, full_name, phone_e164, role, kyc_status, blocked, created_at')
    .order('created_at', { ascending: false })
    .limit(200)

  if (search?.trim()) {
    const sanitized = search.trim().replace(/[(),.'"\\%_]/g, '')
    if (sanitized) {
      const term = `%${sanitized}%`
      query = query.or(`full_name.ilike.${term},email.ilike.${term}`)
    }
  }

  if (role) query = query.eq('role', role as 'driver' | 'partner' | 'garage' | 'admin' | 'pending')
  if (status === 'active') query = query.eq('blocked', false)
  if (status === 'suspended') query = query.eq('blocked', true)

  const { data, error } = await query
  if (error || !data) return []

  return data.map((p) => ({
    id: p.id,
    email: p.email,
    fullName: p.full_name,
    phone: p.phone_e164,
    role: p.role,
    kycStatus: p.kyc_status,
    joinedAt: p.created_at,
    blocked: p.blocked,
  }))
}
