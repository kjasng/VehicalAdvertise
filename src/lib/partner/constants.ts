export const PARTNER_MIN_DEPOSIT_VND = 10_000_000
export const DRIVER_NET_MONTHLY_MIN_VND = 1_000_000
export const DRIVER_NET_MONTHLY_VND = 1_000_000
export const PARTNER_PLATFORM_FEE_PCT = 10
export const GARAGE_INSTALL_FEE_VND = 200_000
export const CAMPAIGN_OPERATIONS_FEE_PCT = 60
export const DRIVER_GROSS_MONTHLY_VND = calculateGrossMonthlyCharge(
  DRIVER_NET_MONTHLY_VND,
  PARTNER_PLATFORM_FEE_PCT,
)
export const MIN_CAMPAIGN_MONTHS = 3
export const CAMPAIGN_PACKAGE_OPTIONS = [
  { value: '3', label: '3 months' },
  { value: '6', label: '6 months' },
  { value: '12', label: '12 months' },
  { value: 'business', label: 'Business / Doanh Nghiệp' },
] as const
export const DEFAULT_CAMPAIGN_PLAN = {
  label: 'Pilot',
  package: '3',
  durationMonths: 3,
  driverCount: 10,
} as const
export const SEPAY_QR_IMAGE_URL = 'https://qr.sepay.vn/img'

export type CampaignPackageValue = (typeof CAMPAIGN_PACKAGE_OPTIONS)[number]['value']

export function calculateGrossMonthlyCharge(driverNetVnd: number, platformFeePct: number) {
  const platformRate = Math.min(Math.max(platformFeePct, 0), 99) / 100
  return Math.ceil(driverNetVnd / (1 - platformRate))
}

export function calculateDriverMonthlyBudgetVnd(driverCount: number) {
  return safeCount(driverCount) * DRIVER_GROSS_MONTHLY_VND
}

export function calculateCampaignOperationsReserveVnd(driverCount: number) {
  const installReserveVnd = safeCount(driverCount) * GARAGE_INSTALL_FEE_VND
  return Math.ceil((installReserveVnd * CAMPAIGN_OPERATIONS_FEE_PCT) / 100)
}

export function calculateCampaignSetupReserveVnd(driverCount: number) {
  const safeDriverCount = safeCount(driverCount)
  return (
    safeDriverCount * GARAGE_INSTALL_FEE_VND +
    calculateCampaignOperationsReserveVnd(safeDriverCount)
  )
}

export function calculateCampaignBudgetReserveVnd({
  driverCount,
  durationMonths,
}: {
  driverCount: number
  durationMonths: number
}) {
  return (
    calculateDriverMonthlyBudgetVnd(driverCount) * safeCount(durationMonths) +
    calculateCampaignSetupReserveVnd(driverCount)
  )
}

export function formatVnd(amount: number) {
  return amount.toLocaleString('vi-VN') + ' VNĐ'
}

export function buildSePayQrImageUrl({
  amountVnd,
  memo,
  bankCode,
  bankAccount,
}: {
  amountVnd: number
  memo: string
  bankCode: string
  bankAccount: string
}) {
  const params = new URLSearchParams({
    acc: bankAccount,
    bank: bankCode,
    amount: String(amountVnd),
    des: memo,
    template: 'qronly',
  })

  return `${SEPAY_QR_IMAGE_URL}?${params.toString()}`
}

function safeCount(value: number) {
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0
}
