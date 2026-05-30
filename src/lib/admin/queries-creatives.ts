import 'server-only'

import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export type CreativeQueueRow = {
  id: string
  campaignName: string
  partnerName: string
  submittedAt: string
  status: string
  imageUrl: string | null
  budgetVnd: number
}

export async function getCreativesQueue(): Promise<CreativeQueueRow[]> {
  const supabase = createSupabaseAdminClient()

  const { data: campaigns, error } = await supabase
    .from('campaigns')
    .select('id, name, creative_url, budget_vnd, status, created_at, partner_id')
    .eq('status', 'submitted')
    .order('created_at', { ascending: true })

  if (error || !campaigns?.length) return []

  // Batch-fetch partner profiles to avoid N+1
  const partnerIds = [...new Set(campaigns.map((c) => c.partner_id))]
  const { data: partnerProfiles } = await supabase
    .from('profiles')
    .select('id, full_name')
    .in('id', partnerIds)

  const nameById = Object.fromEntries((partnerProfiles ?? []).map((p) => [p.id, p.full_name]))

  return campaigns.map((c) => ({
    id: c.id,
    campaignName: c.name,
    partnerName: nameById[c.partner_id] ?? 'Unknown',
    submittedAt: c.created_at,
    status: c.status,
    imageUrl: c.creative_url,
    budgetVnd: c.budget_vnd,
  }))
}
