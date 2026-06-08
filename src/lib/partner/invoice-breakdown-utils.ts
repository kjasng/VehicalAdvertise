import type {
  PartnerCampaignInvoiceLine,
  PartnerCampaignInvoiceTotals,
} from './invoice-breakdown-types'

type InvoicePeriod = {
  id: string
  campaign_id: string
  contract_id: string
  driver_id: string
  period_start: string
  period_end: string
  driver_net_vnd: number
  gross_charge_vnd: number
  platform_fee_vnd: number
  status: string
  created_at: string
}

type InvoiceContract = {
  id: string
  campaign_id: string
  driver_id: string
  vehicle_id: string
}

type GarageEarning = {
  id: string
  contract_id: string
  garage_id: string
  amount_vnd: number
  approved_at: string
  source: string
}

type ProfileLookup = { id: string; full_name: string; email: string | null }
type VehicleLookup = { id: string; plate: string }
type GarageLookup = { id: string; shop_name: string }

export function emptyPartnerInvoiceTotals(): PartnerCampaignInvoiceTotals {
  return {
    budgetVnd: 0,
    driverPaidVnd: 0,
    garagePaidVnd: 0,
    platformFeeVnd: 0,
    remainingVnd: 0,
    estimatedDriverVnd: 0,
    estimatedGarageVnd: 0,
    estimatedOperationsVnd: 0,
    estimatedPlatformFeeVnd: 0,
  }
}

export function buildPartnerInvoiceBreakdown({
  periods,
  garageEarnings,
  contracts,
  profiles,
  vehicles,
  garages,
}: {
  periods: InvoicePeriod[]
  garageEarnings: GarageEarning[]
  contracts: InvoiceContract[]
  profiles: ProfileLookup[]
  vehicles: VehicleLookup[]
  garages: GarageLookup[]
}) {
  const campaignByContract = Object.fromEntries(
    contracts.map((contract) => [contract.id, contract.campaign_id]),
  )
  const contractById = Object.fromEntries(contracts.map((contract) => [contract.id, contract]))
  const profileById = Object.fromEntries(profiles.map((profile) => [profile.id, profile]))
  const vehicleById = Object.fromEntries(vehicles.map((vehicle) => [vehicle.id, vehicle]))
  const garageById = Object.fromEntries(garages.map((garage) => [garage.id, garage]))
  const actualByCampaign: Record<string, { driver: number; garage: number; platform: number }> = {}
  const linesByCampaign: Record<string, PartnerCampaignInvoiceLine[]> = {}

  for (const period of periods) {
    const current = (actualByCampaign[period.campaign_id] ??= { driver: 0, garage: 0, platform: 0 })
    current.driver += period.driver_net_vnd
    current.platform += period.platform_fee_vnd
    const contract = contractById[period.contract_id]
    const driver = profileById[period.driver_id]
    const vehicle = contract ? vehicleById[contract.vehicle_id] : null
    pushLine(linesByCampaign, period.campaign_id, {
      id: `driver-${period.id}`,
      kind: 'driver_period',
      label: 'Thu nhập hàng tháng của tài xế',
      recipientName: driver?.full_name ?? driver?.email ?? 'Driver',
      vehiclePlate: vehicle?.plate ?? '—',
      periodLabel: `${period.period_start} → ${period.period_end}`,
      serviceDate: period.created_at,
      driverNetVnd: period.driver_net_vnd,
      platformFeeVnd: period.platform_fee_vnd,
      garageVnd: 0,
      amountVnd: period.gross_charge_vnd,
      status: period.status,
    })
  }

  for (const earning of garageEarnings) {
    const campaignId = campaignByContract[earning.contract_id]
    if (!campaignId) continue
    const current = (actualByCampaign[campaignId] ??= { driver: 0, garage: 0, platform: 0 })
    current.garage += earning.amount_vnd
    const contract = contractById[earning.contract_id]
    const vehicle = contract ? vehicleById[contract.vehicle_id] : null
    const garage = garageById[earning.garage_id]
    pushLine(linesByCampaign, campaignId, {
      id: `garage-${earning.id}`,
      kind: 'garage_install',
      label: 'Công lắp đặt decal',
      recipientName: garage?.shop_name ?? 'Garage',
      vehiclePlate: vehicle?.plate ?? '—',
      periodLabel: earning.approved_at.slice(0, 10),
      serviceDate: earning.approved_at,
      driverNetVnd: 0,
      platformFeeVnd: 0,
      garageVnd: earning.amount_vnd,
      amountVnd: earning.amount_vnd,
      status: earning.source,
    })
  }

  for (const lines of Object.values(linesByCampaign)) {
    lines.sort(
      (a, b) => a.serviceDate.localeCompare(b.serviceDate) || a.label.localeCompare(b.label),
    )
  }

  return { actualByCampaign, linesByCampaign }
}

export function partnerPackageLabel(months: number) {
  return [3, 6, 12].includes(months) ? `${months} months` : 'Business'
}

export function countBillingMonths(startDate: string, endDate: string) {
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

function pushLine(
  linesByCampaign: Record<string, PartnerCampaignInvoiceLine[]>,
  campaignId: string,
  line: PartnerCampaignInvoiceLine,
) {
  if (!linesByCampaign[campaignId]) linesByCampaign[campaignId] = []
  linesByCampaign[campaignId].push(line)
}
