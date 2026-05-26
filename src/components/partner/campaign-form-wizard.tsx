'use client'

/**
 * CampaignFormWizard — 4-step wizard: Brief → Creative → Budget → Review.
 * Uses react-hook-form + zod. Submit is stubbed (console.log + toast).
 * Step field panels extracted to campaign-wizard-steps.tsx.
 */
import { useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { cn } from '@/lib/utils'

import type { WizardFormValues } from './campaign-wizard-steps'
import { WizardStepFields } from './campaign-wizard-steps'

// ── Schema ─────────────────────────────────────────────────────────────────────
// Use z.string() for numeric inputs to avoid zodResolver/coerce generics
// mismatch with react-hook-form v7. Numeric validation via .refine().
const campaignSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  districts: z.string().min(1, 'Enter at least one district'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  creativeId: z.string().min(1, 'Select a creative asset'),
  targetKm: z
    .string()
    .min(1, 'Target km is required')
    .refine((v) => !isNaN(Number(v)) && Number(v) >= 1000, 'Minimum 1,000 km'),
  budgetVnd: z
    .string()
    .min(1, 'Budget is required')
    .refine((v) => !isNaN(Number(v)) && Number(v) >= 1_000_000, 'Minimum ₫1,000,000'),
})

const STEPS = ['Brief', 'Creative', 'Budget', 'Review'] as const
type StepIndex = 0 | 1 | 2 | 3

const STEP_FIELDS: Record<StepIndex, (keyof WizardFormValues)[]> = {
  0: ['name', 'districts', 'startDate', 'endDate'],
  1: ['creativeId'],
  2: ['targetKm', 'budgetVnd'],
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
      districts: '',
      startDate: '',
      endDate: '',
      creativeId: '',
      targetKm: '10000',
      budgetVnd: '10000000',
    },
  })

  async function onSubmit(values: WizardFormValues) {
    setSubmitting(true)
    console.log('[CampaignFormWizard] stub submit:', values)
    await new Promise((r) => setTimeout(r, 600))
    toast.success('Campaign submitted for review!')
    setSubmitting(false)
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
        <ol className="flex items-center gap-0">
          {STEPS.map((label, i) => (
            <li key={label} className="flex items-center">
              <div className="flex items-center gap-2">
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
                    'mx-3 h-px w-8 sm:w-12',
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
