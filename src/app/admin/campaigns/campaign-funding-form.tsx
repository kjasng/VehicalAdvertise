'use client'

import { useState, useTransition } from 'react'

import { Save } from 'lucide-react'
import { toast } from 'sonner'

import { updateCampaignFunding } from './actions'

type FundingMode = 'monthly_cap'

type CampaignFundingFormProps = {
  campaignId: string
  fundingMode: string
  monthlyBudgetVnd: number | null
  driverNetMonthlyVnd: number
  platformFeePct: number
  activeDriverLimit: number | null
}

export function CampaignFundingForm({
  campaignId,
  monthlyBudgetVnd,
  driverNetMonthlyVnd,
  platformFeePct,
  activeDriverLimit,
}: CampaignFundingFormProps) {
  const [pending, startTransition] = useTransition()
  const mode: FundingMode = 'monthly_cap'
  const [monthlyBudget, setMonthlyBudget] = useState(String(monthlyBudgetVnd ?? ''))
  const [driverNet, setDriverNet] = useState(String(driverNetMonthlyVnd))
  const [fee, setFee] = useState(String(platformFeePct))
  const [driverLimit, setDriverLimit] = useState(String(activeDriverLimit ?? ''))

  function submit() {
    startTransition(async () => {
      const result = await updateCampaignFunding({
        campaignId,
        fundingMode: mode,
        monthlyBudgetVnd: Number(monthlyBudget),
        driverNetMonthlyVnd: Number(driverNet),
        platformFeePct: Number(fee),
        activeDriverLimit: driverLimit ? Number(driverLimit) : null,
      })
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success('Campaign funding updated')
    })
  }

  return (
    <div className="min-w-[360px] space-y-2">
      <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
        <label className="space-y-1">
          <span className="text-[10px] font-bold tracking-[1.5px] text-[#666666] uppercase">
            Funding
          </span>
          <div className="flex h-9 w-full items-center rounded border border-[#cbccc9] bg-[#f7f8fa] px-2 text-[12px] text-[#666666]">
            Monthly cap
          </div>
        </label>

        <SmallInput label="Cap VND" value={monthlyBudget} onChange={setMonthlyBudget} />

        <button
          type="button"
          disabled={pending}
          onClick={submit}
          className="mt-5 inline-flex h-9 items-center justify-center rounded bg-[#1a1a1a] px-3 text-white hover:bg-[#333] disabled:opacity-50"
          aria-label="Save campaign funding"
          title="Save campaign funding"
        >
          <Save className="size-4" aria-hidden="true" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <SmallInput label="Net / driver" value={driverNet} onChange={setDriverNet} />
        <SmallInput label="Fee %" value={fee} onChange={setFee} />
        <SmallInput label="Driver limit" value={driverLimit} onChange={setDriverLimit} />
      </div>
    </div>
  )
}

function SmallInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="space-y-1">
      <span className="text-[10px] font-bold tracking-[1.5px] text-[#666666] uppercase">
        {label}
      </span>
      <input
        type="number"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-full rounded border border-[#cbccc9] px-2 text-[12px]"
      />
    </label>
  )
}
