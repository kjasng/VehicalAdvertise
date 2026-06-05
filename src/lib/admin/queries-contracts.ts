import 'server-only'

import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export type ContractRow = {
  id: string
  campaignId: string
  campaignName: string
  driverId: string
  driverName: string
  vehicleId: string
  vehiclePlate: string
  vehicleFuel: string
  status: string
  garageName: string | null
  installedAt: string | null
  kmTotal: number
  createdAt: string
}

export type CampaignMatchRow = {
  id: string
  name: string
  partnerId: string
  partnerName: string
  budgetVnd: number
  spentVnd: number
  ratePerKmVnd: number
  dailyCapKm: number
  status: string
  startDate: string
  endDate: string
  contractCount: number
}

export type AvailableDriverRow = {
  id: string
  fullName: string
  phone: string | null
  kycStatus: string
  vehicles: { id: string; plate: string; fuel: string; approved: boolean }[]
}

/** Campaigns shown in the admin Campaigns workspace. */
export async function getCampaignsForMatching(): Promise<CampaignMatchRow[]> {
  const supabase = createSupabaseAdminClient()

  const { data: campaigns, error } = await supabase
    .from('campaigns')
    .select(
      'id, name, partner_id, budget_vnd, spent_vnd, rate_per_km_vnd, daily_cap_km, status, start_date, end_date',
    )
    .order('created_at', { ascending: false })
    .limit(500)

  if (error || !campaigns?.length) return []

  // Partner names
  const partnerIds = [...new Set(campaigns.map((c) => c.partner_id))]
  const { data: partners } = await supabase
    .from('partners')
    .select('id, company_name')
    .in('id', partnerIds)
  const partnerName = Object.fromEntries((partners ?? []).map((p) => [p.id, p.company_name]))

  // Contract counts per campaign
  const { data: contracts } = await supabase
    .from('contracts')
    .select('campaign_id')
    .in(
      'campaign_id',
      campaigns.map((c) => c.id),
    )
  const countMap: Record<string, number> = {}
  for (const c of contracts ?? []) {
    countMap[c.campaign_id] = (countMap[c.campaign_id] ?? 0) + 1
  }

  return campaigns.map((c) => ({
    id: c.id,
    name: c.name,
    partnerId: c.partner_id,
    partnerName: partnerName[c.partner_id] ?? '—',
    budgetVnd: c.budget_vnd,
    spentVnd: c.spent_vnd,
    ratePerKmVnd: c.rate_per_km_vnd,
    dailyCapKm: c.daily_cap_km,
    status: c.status,
    startDate: c.start_date,
    endDate: c.end_date,
    contractCount: countMap[c.id] ?? 0,
  }))
}

/** Contracts for a specific campaign. */
export async function getContractsByCampaign(campaignId: string): Promise<ContractRow[]> {
  const supabase = createSupabaseAdminClient()

  const { data, error } = await supabase
    .from('contracts')
    .select(
      'id, campaign_id, driver_id, vehicle_id, status, install_garage_id, installed_at, km_total, created_at, campaigns(name)',
    )
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: true })

  if (error || !data?.length) return []

  const driverIds = [...new Set(data.map((c) => c.driver_id))]
  const vehicleIds = [...new Set(data.map((c) => c.vehicle_id))]
  const garageIds = [...new Set(data.map((c) => c.install_garage_id).filter(Boolean))] as string[]

  const [profilesRes, vehiclesRes, garagesRes] = await Promise.all([
    supabase.from('profiles').select('id, full_name').in('id', driverIds),
    supabase.from('vehicles').select('id, plate, fuel').in('id', vehicleIds),
    garageIds.length
      ? supabase.from('garages').select('id, shop_name').in('id', garageIds)
      : { data: [] },
  ])

  const driverName = Object.fromEntries((profilesRes.data ?? []).map((p) => [p.id, p.full_name]))
  const vehicleById = Object.fromEntries((vehiclesRes.data ?? []).map((v) => [v.id, v]))
  const garageName = Object.fromEntries(
    (garagesRes.data ?? []).map((g) => [g.id, (g as { id: string; shop_name: string }).shop_name]),
  )

  return data.map((c) => ({
    id: c.id,
    campaignId: c.campaign_id,
    campaignName: (c.campaigns as { name: string } | null)?.name ?? '',
    driverId: c.driver_id,
    driverName: driverName[c.driver_id] ?? 'Unknown',
    vehicleId: c.vehicle_id,
    vehiclePlate: vehicleById[c.vehicle_id]?.plate ?? '—',
    vehicleFuel: vehicleById[c.vehicle_id]?.fuel ?? '—',
    status: c.status,
    garageName: c.install_garage_id ? (garageName[c.install_garage_id] ?? null) : null,
    installedAt: c.installed_at,
    kmTotal: Number(c.km_total ?? 0),
    createdAt: c.created_at,
  }))
}

/** KYC-approved drivers with their registered vehicles. */
export async function getAvailableDrivers(): Promise<AvailableDriverRow[]> {
  const supabase = createSupabaseAdminClient()

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, full_name, phone_e164, kyc_status')
    .eq('role', 'driver')
    .eq('kyc_status', 'approved')
    .order('full_name', { ascending: true })
    .limit(200)

  if (error || !profiles?.length) return []

  const driverIds = profiles.map((p) => p.id)
  const { data: vehicles } = await supabase
    .from('vehicles')
    .select('id, driver_id, plate, fuel, approved')
    .in('driver_id', driverIds)

  const vehiclesByDriver: Record<
    string,
    { id: string; plate: string; fuel: string; approved: boolean }[]
  > = {}
  for (const v of vehicles ?? []) {
    if (!vehiclesByDriver[v.driver_id]) vehiclesByDriver[v.driver_id] = []
    vehiclesByDriver[v.driver_id].push({
      id: v.id,
      plate: v.plate,
      fuel: v.fuel,
      approved: v.approved,
    })
  }

  return profiles.map((p) => ({
    id: p.id,
    fullName: p.full_name,
    phone: p.phone_e164,
    kycStatus: p.kyc_status,
    vehicles: vehiclesByDriver[p.id] ?? [],
  }))
}
