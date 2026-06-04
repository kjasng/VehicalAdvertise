export const PARTNER_MIN_DEPOSIT_VND = 10_000_000
export const DRIVER_GROSS_MONTHLY_VND = 1_100_000
export const MIN_CAMPAIGN_MONTHS = 3

export function formatVnd(amount: number) {
  return amount.toLocaleString('vi-VN') + ' VNĐ'
}
