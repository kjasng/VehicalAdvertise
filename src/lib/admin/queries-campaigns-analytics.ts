import 'server-only'

import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export type CampaignAnalyticsRow = {
  id: string
  name: string
  partnerName: string
  status: string
  startDate: string
  endDate: string
  budgetVnd: number
  spentVnd: number
  fundingMode: string
  monthlyBudgetVnd: number | null
  balancePercent: number | null
  driverNetMonthlyVnd: number
  platformFeePct: number
  activeDriverLimit: number | null
  burnPct: number
  kmTotal: number
  activeDrivers: number
}

export async function getCampaignAnalytics(): Promise<CampaignAnalyticsRow[]> {
  const supabase = createSupabaseAdminClient()

  // Fetch campaigns + partner names in parallel with contract stats
  const [campaignsRes, contractsRes] = await Promise.all([
    supabase
      .from('campaigns')
      .select(
        'id, name, partner_id, status, start_date, end_date, budget_vnd, spent_vnd, funding_mode, monthly_budget_vnd, balance_percent, driver_net_monthly_vnd, platform_fee_pct, active_driver_limit',
      )
      .order('created_at', { ascending: false })
      .limit(500),
    supabase.from('contracts').select('id, campaign_id, driver_id, vehicle_id, km_total, status'),
  ])

  if (campaignsRes.error) {
    console.error('[getCampaignAnalytics] campaigns error:', campaignsRes.error.message)
    return []
  }

  const campaigns = campaignsRes.data ?? []
  if (!campaigns.length) return []

  // Fetch partner company names
  const partnerIds = [...new Set(campaigns.map((c) => c.partner_id))]
  const { data: partners } = partnerIds.length
    ? await supabase.from('partners').select('id, company_name').in('id', partnerIds)
    : { data: [] }

  const partnerName = Object.fromEntries((partners ?? []).map((p) => [p.id, p.company_name]))

  // Aggregate contracts by campaign_id (JS-side, safe for pilot scale)
  const contractsByCampaign = new Map<
    string,
    { kmTotal: number; drivers: Set<string>; vehicles: Set<string>; hasRunning: number }
  >()
  for (const c of contractsRes.data ?? []) {
    const agg = contractsByCampaign.get(c.campaign_id) ?? {
      kmTotal: 0,
      drivers: new Set(),
      vehicles: new Set(),
      hasRunning: 0,
    }
    agg.kmTotal += Number(c.km_total ?? 0)
    agg.drivers.add(c.driver_id)
    agg.vehicles.add(c.vehicle_id)
    if (c.status === 'running') agg.hasRunning++
    contractsByCampaign.set(c.campaign_id, agg)
  }

  return campaigns.map((c) => {
    const agg = contractsByCampaign.get(c.id)
    const burnPct = c.budget_vnd > 0 ? Math.round((c.spent_vnd / c.budget_vnd) * 100) : 0
    return {
      id: c.id,
      name: c.name,
      partnerName: partnerName[c.partner_id] ?? 'Unknown',
      status: c.status,
      startDate: c.start_date,
      endDate: c.end_date,
      budgetVnd: c.budget_vnd,
      spentVnd: c.spent_vnd,
      fundingMode: c.funding_mode ?? 'monthly_cap',
      monthlyBudgetVnd: c.monthly_budget_vnd,
      balancePercent: c.balance_percent,
      driverNetMonthlyVnd: c.driver_net_monthly_vnd ?? 1_100_000,
      platformFeePct: Number(c.platform_fee_pct ?? 20),
      activeDriverLimit: c.active_driver_limit,
      burnPct,
      kmTotal: Math.round(agg?.kmTotal ?? 0),
      activeDrivers: agg?.drivers.size ?? 0,
    }
  })
}

export async function getCampaignAnalyticsById(
  campaignId: string,
): Promise<CampaignAnalyticsRow | null> {
  const supabase = createSupabaseAdminClient()

  const [campaignRes, contractsRes] = await Promise.all([
    supabase
      .from('campaigns')
      .select(
        'id, name, partner_id, status, start_date, end_date, budget_vnd, spent_vnd, funding_mode, monthly_budget_vnd, balance_percent, driver_net_monthly_vnd, platform_fee_pct, active_driver_limit',
      )
      .eq('id', campaignId)
      .maybeSingle(),
    supabase
      .from('contracts')
      .select('id, campaign_id, driver_id, vehicle_id, km_total, status')
      .eq('campaign_id', campaignId),
  ])

  if (campaignRes.error) {
    console.error('[getCampaignAnalyticsById] campaign error:', campaignRes.error.message)
    return null
  }
  const campaign = campaignRes.data
  if (!campaign) return null
  if (contractsRes.error) {
    console.error('[getCampaignAnalyticsById] contracts error:', contractsRes.error.message)
  }

  const { data: partner } = await supabase
    .from('partners')
    .select('company_name')
    .eq('id', campaign.partner_id)
    .maybeSingle()

  const driverIds = new Set<string>()
  let kmTotal = 0
  for (const contract of contractsRes.data ?? []) {
    driverIds.add(contract.driver_id)
    kmTotal += Number(contract.km_total ?? 0)
  }

  const burnPct =
    campaign.budget_vnd > 0 ? Math.round((campaign.spent_vnd / campaign.budget_vnd) * 100) : 0

  return {
    id: campaign.id,
    name: campaign.name,
    partnerName: partner?.company_name ?? 'Unknown',
    status: campaign.status,
    startDate: campaign.start_date,
    endDate: campaign.end_date,
    budgetVnd: campaign.budget_vnd,
    spentVnd: campaign.spent_vnd,
    fundingMode: campaign.funding_mode ?? 'monthly_cap',
    monthlyBudgetVnd: campaign.monthly_budget_vnd,
    balancePercent: campaign.balance_percent,
    driverNetMonthlyVnd: campaign.driver_net_monthly_vnd ?? 1_100_000,
    platformFeePct: Number(campaign.platform_fee_pct ?? 20),
    activeDriverLimit: campaign.active_driver_limit,
    burnPct,
    kmTotal: Math.round(kmTotal),
    activeDrivers: driverIds.size,
  }
}
