import 'server-only'

import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export type PartnerBalanceRow = {
  id: string
  companyName: string
  contactName: string
  email: string | null
  balanceVnd: number
  status: string
}

export async function getPartnerBalances(): Promise<PartnerBalanceRow[]> {
  const supabase = createSupabaseAdminClient()

  const { data: partners, error } = await supabase
    .from('partners')
    .select('id, company_name, balance_vnd, status')
    .order('company_name', { ascending: true })

  if (error) {
    console.error('[getPartnerBalances] query error:', error.message)
    return []
  }
  if (!partners?.length) return []

  const ids = partners.map((p) => p.id)
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .in('id', ids)

  const profileById = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]))

  return partners.map((p) => ({
    id: p.id,
    companyName: p.company_name,
    contactName: profileById[p.id]?.full_name ?? '—',
    email: profileById[p.id]?.email ?? null,
    balanceVnd: p.balance_vnd,
    status: p.status,
  }))
}
