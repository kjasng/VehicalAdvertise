export const PARTNER_MIN_DEPOSIT_VND = 10_000_000
export const DRIVER_NET_MONTHLY_MIN_VND = 1_000_000
export const DRIVER_NET_MONTHLY_VND = 1_000_000
export const PARTNER_PLATFORM_FEE_PCT = 10
export const GARAGE_INSTALL_FEE_VND = 3_200_000
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
export const SEPAY_QR_IMAGE_URL = 'https://qr.sepay.vn/img'

export type CampaignPackageValue = (typeof CAMPAIGN_PACKAGE_OPTIONS)[number]['value']

export function calculateGrossMonthlyCharge(driverNetVnd: number, platformFeePct: number) {
  const platformRate = Math.min(Math.max(platformFeePct, 0), 99) / 100
  return Math.ceil(driverNetVnd / (1 - platformRate))
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
