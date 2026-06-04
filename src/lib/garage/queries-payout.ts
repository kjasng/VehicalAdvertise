import 'server-only'

import { getPricingSettings } from '@/lib/admin/queries-pricing-settings'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

import { getGarageProfile } from './queries-context'
import type { GarageEarningRow, GaragePayoutData, GarageWithdrawalRow } from './types'

export async function getGaragePayoutData(): Promise<GaragePayoutData | null> {
  const profile = await getGarageProfile()
  if (!profile) return null

  const supabase = createSupabaseAdminClient()
  const [pricing, earningsRes, withdrawalsRes] = await Promise.all([
    getPricingSettings(),
    supabase
      .from('garage_earnings')
      .select('id, amount_vnd, created_at, contract_id')
      .eq('garage_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(100),
    supabase
      .from('garage_withdrawals')
      .select('id, withdrawal_number, amount_vnd, status, requested_at, paid_at, failure_reason')
      .eq('garage_id', profile.id)
      .order('requested_at', { ascending: false })
      .limit(100),
  ])

  const earnings = await hydrateEarnings(
    (earningsRes.data ?? []).map((row) => ({
      id: row.id,
      amountVnd: row.amount_vnd,
      createdAt: row.created_at,
      contractId: row.contract_id,
      campaignName: 'Campaign',
      vehiclePlate: '—',
    })),
  )
  const withdrawals: GarageWithdrawalRow[] = (withdrawalsRes.data ?? []).map((row) => ({
    id: row.id,
    withdrawalNumber: row.withdrawal_number,
    amountVnd: row.amount_vnd,
    status: row.status,
    requestedAt: row.requested_at,
    paidAt: row.paid_at,
    failureReason: row.failure_reason,
  }))

  return {
    profile,
    minimumWithdrawalVnd: pricing.garageMinimumWithdrawalVnd,
    lifetimeEarningsVnd: earnings.reduce((sum, row) => sum + row.amountVnd, 0),
    withdrawalsTotalVnd: withdrawals
      .filter((row) => row.status !== 'failed')
      .reduce((sum, row) => sum + row.amountVnd, 0),
    earnings,
    withdrawals,
  }
}

async function hydrateEarnings(rows: GarageEarningRow[]): Promise<GarageEarningRow[]> {
  if (!rows.length) return []

  const supabase = createSupabaseAdminClient()
  const contractIds = [...new Set(rows.map((row) => row.contractId))]
  const { data: contracts } = await supabase
    .from('contracts')
    .select('id, campaign_id, vehicle_id')
    .in('id', contractIds)

  const campaignIds = [...new Set((contracts ?? []).map((row) => row.campaign_id))]
  const vehicleIds = [...new Set((contracts ?? []).map((row) => row.vehicle_id))]
  const [campaignsRes, vehiclesRes] = await Promise.all([
    campaignIds.length
      ? supabase.from('campaigns').select('id, name').in('id', campaignIds)
      : Promise.resolve({ data: [] }),
    vehicleIds.length
      ? supabase.from('vehicles').select('id, plate').in('id', vehicleIds)
      : Promise.resolve({ data: [] }),
  ])

  const contractById = Object.fromEntries((contracts ?? []).map((row) => [row.id, row]))
  const campaignById = Object.fromEntries(
    (campaignsRes.data ?? []).map((row) => [row.id, row.name]),
  )
  const plateById = Object.fromEntries((vehiclesRes.data ?? []).map((row) => [row.id, row.plate]))

  return rows.map((row) => {
    const contract = contractById[row.contractId]
    return {
      ...row,
      campaignName: contract ? (campaignById[contract.campaign_id] ?? 'Campaign') : 'Campaign',
      vehiclePlate: contract ? (plateById[contract.vehicle_id] ?? '—') : '—',
    }
  })
}
