import {
  CAMPAIGN_OPERATIONS_FEE_PCT,
  DEFAULT_CAMPAIGN_PLAN,
  DRIVER_NET_MONTHLY_MIN_VND,
  DRIVER_NET_MONTHLY_VND,
  GARAGE_INSTALL_FEE_VND,
  PARTNER_PLATFORM_FEE_PCT,
  calculateCampaignBudgetReserveVnd,
  calculateCampaignOperationsReserveVnd,
  calculateCampaignSetupReserveVnd,
  calculateDriverMonthlyBudgetVnd,
  formatVnd,
} from '@/lib/partner/constants'

import type { WizardFormValues } from './campaign-wizard-steps'

export function CampaignBudgetHint({ values }: { values: WizardFormValues }) {
  const parsedDriverCount = Number(values.driverCount || 0)
  const safeDriverCount = Number.isFinite(parsedDriverCount)
    ? Math.floor(Math.max(0, parsedDriverCount))
    : 0
  const requiredMonthly = calculateDriverMonthlyBudgetVnd(safeDriverCount)
  const durationMonths = DEFAULT_CAMPAIGN_PLAN.durationMonths
  const installReserve = safeDriverCount * GARAGE_INSTALL_FEE_VND
  const operationsReserve = calculateCampaignOperationsReserveVnd(safeDriverCount)
  const setupReserve = calculateCampaignSetupReserveVnd(safeDriverCount)
  const minimumBalance = calculateCampaignBudgetReserveVnd({
    driverCount: safeDriverCount,
    durationMonths,
  })

  return (
    <div className="rounded-md border border-[#cbccc9] bg-[#f7f8fa] p-3 text-[12px] text-[#666666]">
      <p className="text-[11px] font-bold tracking-[2px] text-[#ff5c00] uppercase">
        Locked plan: {DEFAULT_CAMPAIGN_PLAN.label}
      </p>
      <p className="font-bold text-[#1a1a1a]">Plan monthly budget: {formatVnd(requiredMonthly)}</p>
      <p>
        Driver payout: {formatDriverPayout()}/driver/month. Platform fee: {PARTNER_PLATFORM_FEE_PCT}
        %.
      </p>
      <p>
        Decal install: {formatVnd(GARAGE_INSTALL_FEE_VND)}/car = {formatVnd(installReserve)}
      </p>
      <p>
        Maintenance / operations reserve ({CAMPAIGN_OPERATIONS_FEE_PCT}%):{' '}
        {formatVnd(operationsReserve)}
      </p>
      <p>Setup + operations reserve: {formatVnd(setupReserve)}</p>
      <p>Minimum balance before publish: {formatVnd(minimumBalance)}</p>
    </div>
  )
}

function formatDriverPayout() {
  if (DRIVER_NET_MONTHLY_MIN_VND === DRIVER_NET_MONTHLY_VND) {
    return formatVnd(DRIVER_NET_MONTHLY_VND)
  }
  return `${formatVnd(DRIVER_NET_MONTHLY_MIN_VND)} - ${formatVnd(DRIVER_NET_MONTHLY_VND)}`
}
