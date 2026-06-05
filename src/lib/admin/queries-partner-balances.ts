import 'server-only'

import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export type PartnerBalanceRow = {
  id: string
  companyName: string
  contactName: string
  email: string | null
  balanceVnd: number
  status: string
  campaigns: PartnerCampaignSummary[]
  campaignCount: number
}

export type PartnerCampaignSummary = {
  id: string
  name: string
  status: string
  startDate: string
  endDate: string
  createdAt: string
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
  const [{ data: profiles }, { data: campaigns }] = await Promise.all([
    supabase.from('profiles').select('id, full_name, email').in('id', ids),
    supabase
      .from('campaigns')
      .select('id, partner_id, name, status, start_date, end_date, created_at')
      .in('partner_id', ids)
      .order('created_at', { ascending: false }),
  ])

  const profileById = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]))
  const campaignsByPartner = groupCampaigns(campaigns ?? [])

  return partners.map((p) => ({
    id: p.id,
    companyName: p.company_name,
    contactName: profileById[p.id]?.full_name ?? '—',
    email: profileById[p.id]?.email ?? null,
    balanceVnd: p.balance_vnd,
    status: p.status,
    campaigns: campaignsByPartner[p.id] ?? [],
    campaignCount: campaignsByPartner[p.id]?.length ?? 0,
  }))
}

export async function getPartnerCampaigns(partnerId: string) {
  const supabase = createSupabaseAdminClient()
  const [{ data: partner }, { data: campaigns, error }] = await Promise.all([
    supabase.from('partners').select('id, company_name').eq('id', partnerId).maybeSingle(),
    supabase
      .from('campaigns')
      .select('id, name, status, start_date, end_date, budget_vnd, spent_vnd, created_at')
      .eq('partner_id', partnerId)
      .order('created_at', { ascending: false }),
  ])

  if (error) {
    console.error('[getPartnerCampaigns] query error:', error.message)
    return null
  }
  if (!partner) return null

  return {
    partnerName: partner.company_name,
    campaigns: (campaigns ?? []).map((campaign) => ({
      id: campaign.id,
      name: campaign.name,
      status: campaign.status,
      startDate: campaign.start_date,
      endDate: campaign.end_date,
      budgetVnd: campaign.budget_vnd,
      spentVnd: campaign.spent_vnd,
      createdAt: campaign.created_at,
    })),
  }
}

function groupCampaigns(
  campaigns: {
    id: string
    partner_id: string
    name: string
    status: string
    start_date: string
    end_date: string
    created_at: string
  }[],
) {
  const grouped: Record<string, PartnerCampaignSummary[]> = {}
  for (const campaign of campaigns) {
    grouped[campaign.partner_id] = grouped[campaign.partner_id] ?? []
    grouped[campaign.partner_id].push({
      id: campaign.id,
      name: campaign.name,
      status: campaign.status,
      startDate: campaign.start_date,
      endDate: campaign.end_date,
      createdAt: campaign.created_at,
    })
  }
  return grouped
}
