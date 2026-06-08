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
import { MIN_CAMPAIGN_MONTHS } from '@/lib/partner/constants'
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
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    creativeUrls: z.string().min(1, 'Upload at least one creative image'),
    planPackage: z.enum(['3', '6', '12', 'business']),
    driverCount: z
      .string()
      .min(1, 'Number of drivers is required')
      .refine((v) => Number.isInteger(Number(v)) && Number(v) > 0, 'Driver count must be positive'),
    qrTargetUrl: z.string().url('QR target URL must be valid'),
  })
  .refine((v) => v.endDate >= addMonths(v.startDate, MIN_CAMPAIGN_MONTHS), {
    message: 'Chiến dịch phải kéo dài tối thiểu 3 tháng.',
    path: ['endDate'],
  })

const STEPS = ['Brief', 'Creative', 'Budget', 'Review'] as const
type StepIndex = 0 | 1 | 2 | 3

const STEP_FIELDS: Record<StepIndex, (keyof WizardFormValues)[]> = {
  0: ['name', 'description', 'startDate', 'endDate'],
  1: ['creativeUrls'],
  2: ['planPackage', 'driverCount', 'qrTargetUrl'],
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
      startDate: '',
      endDate: '',
      creativeUrls: '',
      planPackage: '3',
      driverCount: '10',
      qrTargetUrl: 'https://vehicaladvertise.com',
    },
  })
  const planPackage = useWatch({ control: form.control, name: 'planPackage' })
  const startDate = useWatch({ control: form.control, name: 'startDate' })
  const driverCount = useWatch({ control: form.control, name: 'driverCount' })
  const endDate = useWatch({ control: form.control, name: 'endDate' })

  useEffect(() => {
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

  // Only the final Review step may submit. Block any implicit submission
  // (Enter key in an input, accidental submit events) on earlier steps so
  // advancing with "Next" never triggers a campaign create.
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (step < 3) {
      e.preventDefault()
      return
    }
    void form.handleSubmit(onSubmit)(e)
  }

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
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <WizardStepFields step={step} control={form.control} getValues={form.getValues} />

          {step === 2 && (
            <CampaignBudgetHint
              values={{
                ...form.getValues(),
                driverCount: driverCount ?? '',
                endDate: endDate ?? '',
                planPackage: planPackage ?? '3',
                startDate: startDate ?? '',
              }}
            />
          )}

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
