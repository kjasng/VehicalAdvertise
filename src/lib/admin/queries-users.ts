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

export async function getUsers(): Promise<AdminUserRow[]> {
  const supabase = createSupabaseAdminClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, phone_e164, role, kyc_status, blocked, created_at')
    .order('created_at', { ascending: false })
    .limit(500)

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
