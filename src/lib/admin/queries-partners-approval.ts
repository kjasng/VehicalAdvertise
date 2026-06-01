import 'server-only'

import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export type PartnerApprovalRow = {
  id: string
  companyName: string
  taxCode: string | null
  billingAddress: string | null
  partnerEmail: string | null
  partnerName: string
  submittedAt: string
  status: 'pending' | 'approved' | 'rejected'
  rejectReason: string | null
}

export async function getPartnerApprovalQueue(): Promise<PartnerApprovalRow[]> {
  const supabase = createSupabaseAdminClient()

  const { data: partners, error } = await supabase
    .from('partners')
    .select('id, company_name, tax_code, billing_address, status, reject_reason, approved_at')
    .eq('status', 'pending')
    .order('approved_at', { ascending: true, nullsFirst: true })
    .limit(200)

  if (error) {
    console.error('[getPartnerApprovalQueue] query error:', error.message)
    return []
  }
  if (!partners?.length) return []

  const profileIds = partners.map((p) => p.id)
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, email, created_at')
    .in('id', profileIds)

  const profileById = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]))

  return partners.map((p) => ({
    id: p.id,
    companyName: p.company_name,
    taxCode: p.tax_code,
    billingAddress: p.billing_address,
    partnerEmail: profileById[p.id]?.email ?? null,
    partnerName: profileById[p.id]?.full_name ?? 'Unknown',
    submittedAt: profileById[p.id]?.created_at ?? '',
    status: p.status as PartnerApprovalRow['status'],
    rejectReason: p.reject_reason,
  }))
}
