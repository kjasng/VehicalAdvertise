import 'server-only'

import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export type DriverGarageOption = {
  id: string
  shopName: string
  address: string
  phone: string | null
  serviceArea: string | null
  googleMapsUrl: string | null
  workingHours: string | null
  suggested: boolean
}

export type DriverGarageSelectionData = {
  contract: {
    id: string
    status: string
    campaignName: string
    vehiclePlate: string
    selectedGarage: DriverGarageOption | null
  } | null
  garages: DriverGarageOption[]
}

export async function getDriverGarageSelectionData(): Promise<DriverGarageSelectionData | null> {
  const serverClient = await createSupabaseServerClient()
  const {
    data: { user },
  } = await serverClient.auth.getUser()
  if (!user) return null

  const supabase = createSupabaseAdminClient()
  const [driverRes, contractRes, garagesRes] = await Promise.all([
    supabase.from('drivers').select('primary_city').eq('id', user.id).maybeSingle(),
    supabase
      .from('contracts')
      .select('id, campaign_id, vehicle_id, status, install_garage_id, created_at')
      .eq('driver_id', user.id)
      .in('status', ['matched', 'awaiting_install', 'installed', 'running'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('garages')
      .select('id, shop_name, address, phone, service_area, google_maps_url, working_hours')
      .order('shop_name', { ascending: true }),
  ])

  const garages = sortGarages(
    (garagesRes.data ?? []).map((garage) => toGarageOption(garage, false)),
    driverRes.data?.primary_city ?? '',
    [],
  )

  const contract = contractRes.data
  if (!contract) return { contract: null, garages }

  const [campaignRes, vehicleRes] = await Promise.all([
    supabase.from('campaigns').select('name').eq('id', contract.campaign_id).maybeSingle(),
    supabase.from('vehicles').select('plate').eq('id', contract.vehicle_id).maybeSingle(),
  ])

  return {
    contract: {
      id: contract.id,
      status: contract.status,
      campaignName: campaignRes.data?.name ?? 'Campaign',
      vehiclePlate: vehicleRes.data?.plate ?? '—',
      selectedGarage: contract.install_garage_id
        ? (garages.find((garage) => garage.id === contract.install_garage_id) ?? null)
        : null,
    },
    garages,
  }
}

function toGarageOption(
  garage: {
    id: string
    shop_name: string
    address: string
    phone: string | null
    service_area: string | null
    google_maps_url: string | null
    working_hours: string | null
  },
  suggested: boolean,
): DriverGarageOption {
  return {
    id: garage.id,
    shopName: garage.shop_name,
    address: garage.address,
    phone: garage.phone,
    serviceArea: garage.service_area,
    googleMapsUrl: garage.google_maps_url,
    workingHours: garage.working_hours,
    suggested,
  }
}

function sortGarages(
  garages: DriverGarageOption[],
  city: string,
  districts: string[],
): DriverGarageOption[] {
  const tokens = [city, ...districts].map((value) => value.toLowerCase()).filter(Boolean)
  return garages
    .map((garage) => ({ ...garage, suggested: hasAreaMatch(garage, tokens) }))
    .sort(
      (a, b) => Number(b.suggested) - Number(a.suggested) || a.shopName.localeCompare(b.shopName),
    )
}

function hasAreaMatch(garage: DriverGarageOption, tokens: string[]) {
  if (!tokens.length) return false
  const haystack = `${garage.address} ${garage.serviceArea ?? ''}`.toLowerCase()
  return tokens.some((token) => haystack.includes(token))
}
