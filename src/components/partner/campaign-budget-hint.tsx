import {
  DRIVER_GROSS_MONTHLY_VND,
  DRIVER_NET_MONTHLY_MIN_VND,
  DRIVER_NET_MONTHLY_VND,
  GARAGE_INSTALL_FEE_VND,
  MIN_CAMPAIGN_MONTHS,
  PARTNER_PLATFORM_FEE_PCT,
  formatVnd,
} from '@/lib/partner/constants'

import type { WizardFormValues } from './campaign-wizard-steps'

export function CampaignBudgetHint({ values }: { values: WizardFormValues }) {
  const driverCount = Number(values.driverCount || 0)
  const monthlyCapVnd = Number(values.monthlyCapVnd || 0)
  const requiredMonthly = Math.max(0, driverCount) * DRIVER_GROSS_MONTHLY_VND
  const durationMonths =
    values.planPackage && values.planPackage !== 'business'
      ? Number(values.planPackage)
      : countBillingMonths(values.startDate, values.endDate)
  const installReserve = Math.max(0, driverCount) * GARAGE_INSTALL_FEE_VND
  const minimumBalance = requiredMonthly * durationMonths + installReserve
  const valid = monthlyCapVnd >= requiredMonthly

  return (
    <div className="rounded-md border border-[#cbccc9] bg-[#f7f8fa] p-3 text-[12px] text-[#666666]">
      <p className="font-bold text-[#1a1a1a]">
        Required monthly budget: {formatVnd(requiredMonthly)}
      </p>
      <p>
        Driver payout: {formatDriverPayout()}/driver/month. Platform fee: {PARTNER_PLATFORM_FEE_PCT}
        %.
      </p>
      <p>Garage install fee reserve: {formatVnd(installReserve)}</p>
      <p>Minimum balance before publish: {formatVnd(minimumBalance)}</p>
      {!valid && (
        <p className="mt-1 text-red-600">
          Monthly Cap không đủ. Yêu cầu tối thiểu {formatVnd(requiredMonthly)}/tháng.
        </p>
      )}
    </div>
  )
}

function formatDriverPayout() {
  if (DRIVER_NET_MONTHLY_MIN_VND === DRIVER_NET_MONTHLY_VND) {
    return formatVnd(DRIVER_NET_MONTHLY_VND)
  }
  return `${formatVnd(DRIVER_NET_MONTHLY_MIN_VND)} - ${formatVnd(DRIVER_NET_MONTHLY_VND)}`
}

function countBillingMonths(startDate: string, endDate: string) {
  if (!startDate || !endDate) return MIN_CAMPAIGN_MONTHS
  let cursor = startDate
  let months = 0
  while (cursor < endDate && months < 120) {
    months += 1
    cursor = addMonths(cursor, 1)
  }
  return Math.max(MIN_CAMPAIGN_MONTHS, months)
}

function addMonths(date: string, months: number) {
  const [year, month, day] = date.split('-').map(Number)
  const value = new Date(Date.UTC(year, month - 1, day))
  const originalDay = value.getUTCDate()
  value.setUTCMonth(value.getUTCMonth() + months)
  if (value.getUTCDate() !== originalDay) value.setUTCDate(0)
  return value.toISOString().slice(0, 10)
}
