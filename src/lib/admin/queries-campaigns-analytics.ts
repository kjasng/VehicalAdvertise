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
  qrScans: number
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
    supabase.from('contracts').select('id, campaign_id, driver_id, km_total, status'),
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
    { kmTotal: number; drivers: Set<string>; hasRunning: number }
  >()
  for (const c of contractsRes.data ?? []) {
    const agg = contractsByCampaign.get(c.campaign_id) ?? {
      kmTotal: 0,
      drivers: new Set(),
      hasRunning: 0,
    }
    agg.kmTotal += Number(c.km_total ?? 0)
    agg.drivers.add(c.driver_id)
    if (c.status === 'running') agg.hasRunning++
    contractsByCampaign.set(c.campaign_id, agg)
  }

  // Fetch QR scans per campaign via contract_daily_stats
  const campaignIds = campaigns.map((c) => c.id)
  const { data: dailyStats } = campaignIds.length
    ? await supabase.from('contract_daily_stats').select('contract_id, qr_scans')
    : { data: [] }

  // Map contract_id → campaign_id via contractsRes
  const contractToCampaign = Object.fromEntries(
    (contractsRes.data ?? []).map((c) => [c.id, c.campaign_id]),
  )
  const qrByCampaign = new Map<string, number>()
  for (const stat of dailyStats ?? []) {
    const campId = contractToCampaign[stat.contract_id]
    if (campId) qrByCampaign.set(campId, (qrByCampaign.get(campId) ?? 0) + (stat.qr_scans ?? 0))
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
      qrScans: qrByCampaign.get(c.id) ?? 0,
    }
  })
}
