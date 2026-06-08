import 'server-only'

import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'

import {
  DRIVER_NET_MONTHLY_VND,
  GARAGE_INSTALL_FEE_VND,
  PARTNER_PLATFORM_FEE_PCT,
  calculateCampaignOperationsReserveVnd,
  calculateGrossMonthlyCharge,
} from './constants'
import type { PartnerCampaignInvoiceData } from './invoice-breakdown-types'
import {
  buildPartnerInvoiceBreakdown,
  countBillingMonths,
  emptyPartnerInvoiceTotals,
  partnerPackageLabel,
} from './invoice-breakdown-utils'

export async function getPartnerCampaignInvoices(): Promise<PartnerCampaignInvoiceData | null> {
  const serverClient = await createSupabaseServerClient()
  const {
    data: { user },
  } = await serverClient.auth.getUser()
  if (!user) return null

  const supabase = createSupabaseAdminClient()
  const [partnerRes, campaignsRes] = await Promise.all([
    supabase
      .from('partners')
      .select('company_name, tax_code, billing_address')
      .eq('id', user.id)
      .maybeSingle(),
    supabase
      .from('campaigns')
      .select(
        'id, name, status, budget_vnd, start_date, end_date, created_at, requested_driver_count, active_driver_limit, driver_net_monthly_vnd, platform_fee_pct',
      )
      .eq('partner_id', user.id)
      .order('created_at', { ascending: false }),
  ])

  const partner = {
    companyName: partnerRes.data?.company_name ?? 'Partner',
    taxCode: partnerRes.data?.tax_code ?? null,
    billingAddress: partnerRes.data?.billing_address ?? '',
  }

  if (campaignsRes.error) {
    console.error('[getPartnerCampaignInvoices] campaigns error:', campaignsRes.error.message)
    return { partner, rows: [], totals: emptyPartnerInvoiceTotals() }
  }
  const campaigns = campaignsRes.data ?? []
  if (!campaigns?.length) return { partner, rows: [], totals: emptyPartnerInvoiceTotals() }

  const campaignIds = campaigns.map((campaign) => campaign.id)
  const [periodsRes, contractsRes] = await Promise.all([
    supabase
      .from('driver_earning_periods')
      .select(
        'id, campaign_id, contract_id, driver_id, period_start, period_end, driver_net_vnd, gross_charge_vnd, platform_fee_vnd, status, created_at',
      )
      .in('campaign_id', campaignIds),
    supabase
      .from('contracts')
      .select('id, campaign_id, driver_id, vehicle_id, install_garage_id')
      .in('campaign_id', campaignIds),
  ])

  const contracts = contractsRes.data ?? []
  const contractIds = contracts.map((contract) => contract.id)
  const garageRes = contractIds.length
    ? await supabase
        .from('garage_earnings')
        .select('id, contract_id, garage_id, amount_vnd, approved_at, source')
        .in('contract_id', contractIds)
    : { data: [], error: null }

  for (const result of [periodsRes, contractsRes, garageRes]) {
    if (result.error) {
      console.error('[getPartnerCampaignInvoices] detail error:', result.error.message)
    }
  }

  const periods = (periodsRes.data ?? []).filter((period) => period.status !== 'void')
  const driverIds = [
    ...new Set([
      ...periods.map((period) => period.driver_id),
      ...contracts.map((contract) => contract.driver_id),
    ]),
  ]
  const vehicleIds = [...new Set(contracts.map((contract) => contract.vehicle_id))]
  const garageIds = [...new Set((garageRes.data ?? []).map((earning) => earning.garage_id))]
  const [profilesRes, vehiclesRes, garagesRes] = await Promise.all([
    driverIds.length
      ? supabase.from('profiles').select('id, full_name, email').in('id', driverIds)
      : Promise.resolve({ data: [], error: null }),
    vehicleIds.length
      ? supabase.from('vehicles').select('id, plate').in('id', vehicleIds)
      : Promise.resolve({ data: [], error: null }),
    garageIds.length
      ? supabase.from('garages').select('id, shop_name').in('id', garageIds)
      : Promise.resolve({ data: [], error: null }),
  ])

  for (const result of [profilesRes, vehiclesRes, garagesRes]) {
    if (result.error) {
      console.error('[getPartnerCampaignInvoices] lookup error:', result.error.message)
    }
  }

  const { actualByCampaign, linesByCampaign } = buildPartnerInvoiceBreakdown({
    periods,
    garageEarnings: garageRes.data ?? [],
    contracts,
    profiles: profilesRes.data ?? [],
    vehicles: vehiclesRes.data ?? [],
    garages: garagesRes.data ?? [],
  })

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
    const estimatedOperationsVnd = calculateCampaignOperationsReserveVnd(driverCount)
    const remainingVnd = campaign.budget_vnd - actual.driver - actual.garage - actual.platform

    return {
      id: campaign.id,
      name: campaign.name,
      status: campaign.status,
      createdAt: campaign.created_at,
      startDate: campaign.start_date,
      endDate: campaign.end_date,
      packageLabel: partnerPackageLabel(months),
      driverCount,
      budgetVnd: campaign.budget_vnd,
      driverPaidVnd: actual.driver,
      garagePaidVnd: actual.garage,
      platformFeeVnd: actual.platform,
      remainingVnd,
      estimatedDriverVnd,
      estimatedGarageVnd,
      estimatedOperationsVnd,
      estimatedPlatformFeeVnd,
      lines: linesByCampaign[campaign.id] ?? [],
    }
  })

  return {
    partner,
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
        estimatedOperationsVnd: acc.estimatedOperationsVnd + row.estimatedOperationsVnd,
        estimatedPlatformFeeVnd: acc.estimatedPlatformFeeVnd + row.estimatedPlatformFeeVnd,
      }),
      emptyPartnerInvoiceTotals(),
    ),
  }
}
