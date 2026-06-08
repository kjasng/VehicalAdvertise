export type PartnerCampaignInvoiceLine = {
  id: string
  kind: 'driver_period' | 'garage_install'
  label: string
  recipientName: string
  vehiclePlate: string
  periodLabel: string
  serviceDate: string
  driverNetVnd: number
  platformFeeVnd: number
  garageVnd: number
  amountVnd: number
  status: string
}

export type PartnerCampaignInvoiceRow = {
  id: string
  name: string
  status: string
  createdAt: string
  startDate: string
  endDate: string
  packageLabel: string
  driverCount: number
  budgetVnd: number
  driverPaidVnd: number
  garagePaidVnd: number
  platformFeeVnd: number
  remainingVnd: number
  estimatedDriverVnd: number
  estimatedGarageVnd: number
  estimatedOperationsVnd: number
  estimatedPlatformFeeVnd: number
  lines: PartnerCampaignInvoiceLine[]
}

export type PartnerCampaignInvoiceTotals = {
  budgetVnd: number
  driverPaidVnd: number
  garagePaidVnd: number
  platformFeeVnd: number
  remainingVnd: number
  estimatedDriverVnd: number
  estimatedGarageVnd: number
  estimatedOperationsVnd: number
  estimatedPlatformFeeVnd: number
}

export type PartnerCampaignInvoicePartner = {
  companyName: string
  taxCode: string | null
  billingAddress: string
}

export type PartnerCampaignInvoiceData = {
  partner: PartnerCampaignInvoicePartner
  rows: PartnerCampaignInvoiceRow[]
  totals: PartnerCampaignInvoiceTotals
}
