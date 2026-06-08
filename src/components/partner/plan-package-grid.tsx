'use client'

import { useState } from 'react'

import { PlanCheckoutModal } from '@/components/partner/plan-checkout-modal'
import {
  buildSePayQrImageUrl,
  calculateCampaignBudgetReserveVnd,
  formatVnd,
} from '@/lib/partner/constants'
import { cn } from '@/lib/utils'

type Plan = {
  code: string
  name: string
  label: string
  months: number
  drivers: number
  description: string
  dark?: boolean
}

const PLANS: Plan[] = [
  ['pilot-3m', 'Pilot', '3 months', 3, 10, 'Minimum package for testing one route or district.'],
  ['growth-6m', 'Growth', '6 months', 6, 20, 'Two 10-driver blocks for a longer campaign window.'],
  ['scale-12m', 'Scale', '12 months', 12, 30, 'Annual visibility with three driver blocks.'],
].map(([code, name, label, months, drivers, description]) => ({
  code: String(code),
  name: String(name),
  label: String(label),
  months: Number(months),
  drivers: Number(drivers),
  description: String(description),
}))

PLANS.push({
  code: 'business',
  name: 'Business',
  label: 'Flexible',
  months: 3,
  drivers: 10,
  description: 'Doanh Nghiệp cho campaign cần số lượng xe, thời hạn, hoặc ngân sách riêng.',
  dark: true,
})

type Props = {
  taxCode?: string | null
  bankCode?: string
  bankName?: string
  bankAccount?: string
  accountName?: string
}

export function PlanPackageGrid({
  taxCode,
  bankCode,
  bankName = 'Vietcombank',
  bankAccount = '0123456789',
  accountName = 'VEHICAL ADVERTISE JSC',
}: Props) {
  const [checkoutPlan, setCheckoutPlan] = useState<Plan | null>(null)
  const checkoutAmount = checkoutPlan ? estimatePlanAmount(checkoutPlan) : 0
  const memo =
    checkoutPlan && taxCode?.trim()
      ? `PLAN ${taxCode.trim()} ${checkoutPlan.code.toUpperCase()}`
      : ''
  const qrImageUrl = memo
    ? buildSePayQrImageUrl({
        amountVnd: checkoutAmount,
        memo,
        bankCode: bankCode ?? bankName,
        bankAccount,
      })
    : null

  return (
    <div className="space-y-5">
      <div className="grid gap-4 xl:grid-cols-4">
        {PLANS.map((plan) => (
          <PlanCard key={plan.code} plan={plan} onSelect={() => setCheckoutPlan(plan)} />
        ))}
      </div>

      {checkoutPlan && (
        <PlanCheckoutModal
          open
          planName={checkoutPlan.name}
          planLabel={checkoutPlan.label}
          drivers={checkoutPlan.drivers}
          amountVnd={checkoutAmount}
          qrImageUrl={qrImageUrl}
          bankName={bankName}
          bankAccount={bankAccount}
          accountName={accountName}
          memo={memo}
          onClose={() => setCheckoutPlan(null)}
        />
      )}
    </div>
  )
}

function PlanCard(props: { plan: Plan; onSelect: () => void }) {
  const { plan, onSelect } = props
  return (
    <article
      className={cn(
        'flex min-h-[280px] flex-col rounded-md border p-4',
        plan.dark ? 'border-[#1a1a1a] bg-[#1a1a1a] text-white' : 'border-[#cbccc9] bg-white',
      )}
    >
      <p
        className={cn(
          'text-[11px] font-bold tracking-[2px] uppercase',
          plan.dark ? 'text-[#ffb380]' : 'text-[#ff5c00]',
        )}
      >
        {plan.label}
      </p>
      <h2 className="font-heading mt-1 text-[40px] leading-none">{plan.name}</h2>
      <p className={cn('mt-2 text-[13px]', plan.dark ? 'text-[#d6d6d6]' : 'text-[#666666]')}>
        {plan.description}
      </p>
      <dl className="mt-5 space-y-3 text-[12px]">
        <PlanRow dark={plan.dark} label="Drivers" value={`${plan.drivers}`} />
        <PlanRow dark={plan.dark} label="Duration" value={plan.dark ? 'Custom' : plan.label} />
        <PlanRow dark={plan.dark} label="Total" value={formatVnd(estimatePlanAmount(plan))} />
      </dl>
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          'mt-auto rounded px-3 py-2 text-[12px] font-bold',
          plan.dark
            ? 'bg-white text-[#1a1a1a] hover:bg-[#f7f8fa]'
            : 'bg-[#1a1a1a] text-white hover:bg-[#333]',
        )}
      >
        {plan.dark ? 'Build Business plan' : 'Choose plan'}
      </button>
    </article>
  )
}

function PlanRow({ label, value, dark = false }: { label: string; value: string; dark?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-[#cbccc9]/70 pb-2 last:border-0">
      <dt className={dark ? 'text-[#d6d6d6]' : 'text-[#666666]'}>{label}</dt>
      <dd className="text-right font-mono font-bold">{value}</dd>
    </div>
  )
}

function estimatePlanAmount(plan: Plan) {
  return calculateCampaignBudgetReserveVnd({
    driverCount: plan.drivers,
    durationMonths: plan.months,
  })
}
