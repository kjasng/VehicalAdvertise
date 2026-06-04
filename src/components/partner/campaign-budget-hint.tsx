import { DRIVER_GROSS_MONTHLY_VND, MIN_CAMPAIGN_MONTHS, formatVnd } from '@/lib/partner/constants'

import type { WizardFormValues } from './campaign-wizard-steps'

export function CampaignBudgetHint({ values }: { values: WizardFormValues }) {
  const driverCount = Number(values.driverCount || 0)
  const monthlyCapVnd = Number(values.monthlyCapVnd || 0)
  const requiredMonthly = Math.max(0, driverCount) * DRIVER_GROSS_MONTHLY_VND
  const minimumBalance = requiredMonthly * MIN_CAMPAIGN_MONTHS
  const valid = monthlyCapVnd >= requiredMonthly

  return (
    <div className="rounded-md border border-[#cbccc9] bg-[#f7f8fa] p-3 text-[12px] text-[#666666]">
      <p className="font-bold text-[#1a1a1a]">
        Required monthly budget: {formatVnd(requiredMonthly)}
      </p>
      <p>Minimum balance before publish: {formatVnd(minimumBalance)}</p>
      {!valid && (
        <p className="mt-1 text-red-600">
          Monthly Cap không đủ. Yêu cầu tối thiểu {formatVnd(requiredMonthly)}/tháng.
        </p>
      )}
    </div>
  )
}
