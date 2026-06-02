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
  bodyType: string | null // drivers.body_type — null for non-drivers
}

export async function getUsers(): Promise<AdminUserRow[]> {
  const supabase = createSupabaseAdminClient()

  const { data, error } = await supabase
    .from('profiles')
    .select(
      'id, email, full_name, phone_e164, role, kyc_status, blocked, created_at, drivers(body_type)',
    )
    .order('created_at', { ascending: false })
    .limit(500)

  if (error || !data) return []

  return data.map((p) => {
    const driver = Array.isArray(p.drivers) ? p.drivers[0] : p.drivers
    return {
      id: p.id,
      email: p.email,
      fullName: p.full_name,
      phone: p.phone_e164,
      role: p.role,
      kycStatus: p.kyc_status,
      joinedAt: p.created_at,
      blocked: p.blocked,
      bodyType: (driver as { body_type?: string | null } | null)?.body_type ?? null,
    }
  })
}
