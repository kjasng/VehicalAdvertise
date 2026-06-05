'use client'

/**
 * CampaignFormWizard — 4-step wizard: Brief → Creative → Budget → Review.
 * Uses react-hook-form + zod. Submit writes real campaign rows.
 * Step field panels extracted to campaign-wizard-steps.tsx.
 */
import { useEffect, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { createPartnerCampaign } from '@/app/partner/campaigns/actions'
import { CampaignBudgetHint } from '@/components/partner/campaign-budget-hint'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { DRIVER_GROSS_MONTHLY_VND, MIN_CAMPAIGN_MONTHS } from '@/lib/partner/constants'
import { cn } from '@/lib/utils'

import type { WizardFormValues } from './campaign-wizard-steps'
import { WizardStepFields } from './campaign-wizard-steps'

// ── Schema ─────────────────────────────────────────────────────────────────────
// Use z.string() for numeric inputs to avoid zodResolver/coerce generics
// mismatch with react-hook-form v7. Numeric validation via .refine().
const campaignSchema = z
  .object({
    name: z.string().min(3, 'Name must be at least 3 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    districts: z.string().min(1, 'Enter at least one district'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    creativeUrls: z.string().min(1, 'Upload at least one creative image'),
    planPackage: z.enum(['3', '6', '12', 'business']),
    driverCount: z
      .string()
      .min(1, 'Number of drivers is required')
      .refine((v) => Number.isInteger(Number(v)) && Number(v) > 0, 'Driver count must be positive'),
    monthlyCapVnd: z
      .string()
      .min(1, 'Monthly cap is required')
      .refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'Monthly cap must be positive'),
    qrTargetUrl: z.string().url('QR target URL must be valid'),
  })
  .refine((v) => v.endDate >= addMonths(v.startDate, MIN_CAMPAIGN_MONTHS), {
    message: 'Chiến dịch phải kéo dài tối thiểu 3 tháng.',
    path: ['endDate'],
  })
  .refine((v) => Number(v.monthlyCapVnd) >= Number(v.driverCount) * DRIVER_GROSS_MONTHLY_VND, {
    message: 'Monthly Cap không đủ để chi trả số Driver đã chọn.',
    path: ['monthlyCapVnd'],
  })

const STEPS = ['Brief', 'Creative', 'Budget', 'Review'] as const
type StepIndex = 0 | 1 | 2 | 3

const STEP_FIELDS: Record<StepIndex, (keyof WizardFormValues)[]> = {
  0: ['name', 'description', 'districts', 'startDate', 'endDate'],
  1: ['creativeUrls'],
  2: ['planPackage', 'driverCount', 'monthlyCapVnd', 'qrTargetUrl'],
  3: [],
}

interface Props {
  onSuccess?: () => void
}

export function CampaignFormWizard({ onSuccess }: Props) {
  const [step, setStep] = useState<StepIndex>(0)
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<WizardFormValues>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: '',
      description: '',
      districts: '',
      startDate: '',
      endDate: '',
      creativeUrls: '',
      planPackage: '3',
      driverCount: '10',
      monthlyCapVnd: String(10 * DRIVER_GROSS_MONTHLY_VND),
      qrTargetUrl: 'https://vehicaladvertise.com',
    },
  })
  const planPackage = useWatch({ control: form.control, name: 'planPackage' })
  const startDate = useWatch({ control: form.control, name: 'startDate' })
  const driverCount = useWatch({ control: form.control, name: 'driverCount' })

  useEffect(() => {
    const parsedDriverCount = Math.max(0, Number(driverCount || 0))
    const requiredMonthly = parsedDriverCount * DRIVER_GROSS_MONTHLY_VND
    if (requiredMonthly > 0) {
      const currentMonthlyCap = Number(form.getValues('monthlyCapVnd') || 0)
      if (planPackage !== 'business' || currentMonthlyCap < requiredMonthly) {
        form.setValue('monthlyCapVnd', String(requiredMonthly), { shouldValidate: false })
      }
    }

    if (planPackage !== 'business' && startDate) {
      form.setValue('endDate', addMonths(startDate, Number(planPackage)), {
        shouldValidate: false,
      })
    }
  }, [driverCount, form, planPackage, startDate])

  async function onSubmit(values: WizardFormValues) {
    setSubmitting(true)
    const result = await createPartnerCampaign({
      ...values,
      driverCount: Number(values.driverCount),
      monthlyCapVnd: Number(values.monthlyCapVnd),
    })
    setSubmitting(false)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success('Campaign published and sent for admin review.')
    onSuccess?.()
  }

  const goNext = async () => {
    const valid = await form.trigger(STEP_FIELDS[step])
    if (valid) setStep((s) => Math.min(3, s + 1) as StepIndex)
  }

  const goBack = () => setStep((s) => Math.max(0, s - 1) as StepIndex)

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <nav aria-label="Campaign wizard steps">
        <ol className="flex w-full items-center gap-0">
          {STEPS.map((label, i) => (
            <li key={label} className={cn('flex items-center', i < STEPS.length - 1 && 'flex-1')}>
              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={cn(
                    'flex size-7 items-center justify-center rounded-full text-[11px] font-bold',
                    i === step
                      ? 'bg-[#ff5c00] text-white'
                      : i < step
                        ? 'bg-[#1a1a1a] text-white'
                        : 'bg-[#f0f0ee] text-[#666666]',
                  )}
                  aria-current={i === step ? 'step' : undefined}
                >
                  {i + 1}
                </span>
                <span
                  className={cn(
                    'hidden text-[12px] font-bold tracking-[1px] uppercase sm:block',
                    i === step ? 'text-[#ff5c00]' : i < step ? 'text-[#1a1a1a]' : 'text-[#cbccc9]',
                  )}
                >
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    'mx-2 h-px min-w-3 flex-1 sm:mx-3',
                    i < step ? 'bg-[#1a1a1a]' : 'bg-[#cbccc9]',
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          ))}
        </ol>
      </nav>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <WizardStepFields step={step} control={form.control} getValues={form.getValues} />

          {step === 2 && <CampaignBudgetHint values={form.getValues()} />}

          {/* Navigation */}
          <div className="flex justify-between pt-2">
            <Button type="button" variant="outline" onClick={goBack} disabled={step === 0}>
              Back
            </Button>
            {step < 3 ? (
              <Button
                type="button"
                onClick={goNext}
                className="bg-[#ff5c00] text-white hover:bg-[#e05200]"
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={submitting}
                className="bg-[#ff5c00] text-white hover:bg-[#e05200]"
              >
                {submitting ? 'Submitting…' : 'Submit campaign'}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  )
}

function addMonths(date: string, months: number) {
  if (!date) return ''
  const [year, month, day] = date.split('-').map(Number)
  const d = new Date(Date.UTC(year, month - 1, day))
  const originalDay = d.getUTCDate()
  d.setUTCMonth(d.getUTCMonth() + months)
  if (d.getUTCDate() !== originalDay) d.setUTCDate(0)
  return d.toISOString().slice(0, 10)
}
