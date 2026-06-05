import 'server-only'

import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'

import {
  DRIVER_NET_MONTHLY_VND,
  GARAGE_INSTALL_FEE_VND,
  PARTNER_PLATFORM_FEE_PCT,
  calculateGrossMonthlyCharge,
} from './constants'

export type PartnerCampaignInvoiceRow = {
  id: string
  name: string
  status: string
  packageLabel: string
  driverCount: number
  budgetVnd: number
  driverPaidVnd: number
  garagePaidVnd: number
  platformFeeVnd: number
  remainingVnd: number
  estimatedDriverVnd: number
  estimatedGarageVnd: number
  estimatedPlatformFeeVnd: number
}

export type PartnerCampaignInvoiceData = {
  rows: PartnerCampaignInvoiceRow[]
  totals: Omit<PartnerCampaignInvoiceRow, 'id' | 'name' | 'status' | 'packageLabel' | 'driverCount'>
}

export async function getPartnerCampaignInvoices(): Promise<PartnerCampaignInvoiceData | null> {
  const serverClient = await createSupabaseServerClient()
  const {
    data: { user },
  } = await serverClient.auth.getUser()
  if (!user) return null

  const supabase = createSupabaseAdminClient()
  const { data: campaigns, error } = await supabase
    .from('campaigns')
    .select(
      'id, name, status, budget_vnd, start_date, end_date, requested_driver_count, active_driver_limit, driver_net_monthly_vnd, platform_fee_pct',
    )
    .eq('partner_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[getPartnerCampaignInvoices] campaigns error:', error.message)
    return { rows: [], totals: emptyTotals() }
  }
  if (!campaigns?.length) return { rows: [], totals: emptyTotals() }

  const campaignIds = campaigns.map((campaign) => campaign.id)
  const [periodsRes, contractsRes] = await Promise.all([
    supabase
      .from('driver_earning_periods')
      .select('campaign_id, driver_net_vnd, platform_fee_vnd, status')
      .in('campaign_id', campaignIds),
    supabase.from('contracts').select('id, campaign_id').in('campaign_id', campaignIds),
  ])

  const contracts = contractsRes.data ?? []
  const contractIds = contracts.map((contract) => contract.id)
  const garageRes = contractIds.length
    ? await supabase
        .from('garage_earnings')
        .select('contract_id, amount_vnd')
        .in('contract_id', contractIds)
    : { data: [] }

  const campaignByContract = Object.fromEntries(
    contracts.map((contract) => [contract.id, contract.campaign_id]),
  )
  const actualByCampaign: Record<string, { driver: number; garage: number; platform: number }> = {}
  for (const period of periodsRes.data ?? []) {
    if (period.status === 'void') continue
    const current = (actualByCampaign[period.campaign_id] ??= { driver: 0, garage: 0, platform: 0 })
    current.driver += period.driver_net_vnd
    current.platform += period.platform_fee_vnd
  }
  for (const earning of garageRes.data ?? []) {
    const campaignId = campaignByContract[earning.contract_id]
    if (!campaignId) continue
    const current = (actualByCampaign[campaignId] ??= { driver: 0, garage: 0, platform: 0 })
    current.garage += earning.amount_vnd
  }

  const rows = campaigns.map((campaign) => {
    const actual = actualByCampaign[campaign.id] ?? { driver: 0, garage: 0, platform: 0 }
    const driverCount = campaign.requested_driver_count ?? campaign.active_driver_limit ?? 0
    const months = countBillingMonths(campaign.start_date, campaign.end_date)
    const driverNet = campaign.driver_net_monthly_vnd ?? DRIVER_NET_MONTHLY_VND
    const feePct = campaign.platform_fee_pct ?? PARTNER_PLATFORM_FEE_PCT
    const grossMonthly = calculateGrossMonthlyCharge(driverNet, feePct)
    const estimatedDriverVnd = driverCount * driverNet * months
    const estimatedPlatformFeeVnd = driverCount * (grossMonthly - driverNet) * months
    const estimatedGarageVnd = driverCount * GARAGE_INSTALL_FEE_VND
    const remainingVnd = campaign.budget_vnd - actual.driver - actual.garage - actual.platform

    return {
      id: campaign.id,
      name: campaign.name,
      status: campaign.status,
      packageLabel: packageLabel(months),
      driverCount,
      budgetVnd: campaign.budget_vnd,
      driverPaidVnd: actual.driver,
      garagePaidVnd: actual.garage,
      platformFeeVnd: actual.platform,
      remainingVnd,
      estimatedDriverVnd,
      estimatedGarageVnd,
      estimatedPlatformFeeVnd,
    }
  })

  return {
    rows,
    totals: rows.reduce(
      (acc, row) => ({
        budgetVnd: acc.budgetVnd + row.budgetVnd,
        driverPaidVnd: acc.driverPaidVnd + row.driverPaidVnd,
        garagePaidVnd: acc.garagePaidVnd + row.garagePaidVnd,
        platformFeeVnd: acc.platformFeeVnd + row.platformFeeVnd,
        remainingVnd: acc.remainingVnd + row.remainingVnd,
        estimatedDriverVnd: acc.estimatedDriverVnd + row.estimatedDriverVnd,
        estimatedGarageVnd: acc.estimatedGarageVnd + row.estimatedGarageVnd,
        estimatedPlatformFeeVnd: acc.estimatedPlatformFeeVnd + row.estimatedPlatformFeeVnd,
      }),
      emptyTotals(),
    ),
  }
}

function emptyTotals(): PartnerCampaignInvoiceData['totals'] {
  return {
    budgetVnd: 0,
    driverPaidVnd: 0,
    garagePaidVnd: 0,
    platformFeeVnd: 0,
    remainingVnd: 0,
    estimatedDriverVnd: 0,
    estimatedGarageVnd: 0,
    estimatedPlatformFeeVnd: 0,
  }
}

function packageLabel(months: number) {
  return [3, 6, 12].includes(months) ? `${months} months` : 'Business'
}

function countBillingMonths(startDate: string, endDate: string) {
  let cursor = startDate
  let months = 0
  while (cursor < endDate && months < 120) {
    months += 1
    cursor = addMonths(cursor, 1)
  }
  return Math.max(3, months)
}

function addMonths(date: string, months: number) {
  const [year, month, day] = date.split('-').map(Number)
  const value = new Date(Date.UTC(year, month - 1, day))
  const originalDay = value.getUTCDate()
  value.setUTCMonth(value.getUTCMonth() + months)
  if (value.getUTCDate() !== originalDay) value.setUTCDate(0)
  return value.toISOString().slice(0, 10)
}
