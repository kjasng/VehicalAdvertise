'use client'

/**
 * CampaignWizardSteps — step field panels for CampaignFormWizard.
 *
 * All panels stay mounted and inactive ones are hidden via CSS, so values
 * (including uploaded creatives) survive Back/Next navigation. Unmounting the
 * inputs would drop their react-hook-form Controller values.
 */
import type { Control } from 'react-hook-form'

import { CampaignBudgetHint } from '@/components/partner/campaign-budget-hint'
import { CampaignCreativeUpload } from '@/components/partner/campaign-creative-upload'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  DEFAULT_CAMPAIGN_PLAN,
  calculateDriverMonthlyBudgetVnd,
  formatVnd,
} from '@/lib/partner/constants'
import { cn } from '@/lib/utils'

export interface WizardFormValues {
  name: string
  description: string
  startDate: string
  endDate: string
  creativeUrls: string
  planPackage: string
  driverCount: string
  qrTargetUrl: string
}

interface StepFieldsProps {
  step: number
  control: Control<WizardFormValues>
  getValues: (key: keyof WizardFormValues) => string
}

export function WizardStepFields({ step, control, getValues }: StepFieldsProps) {
  return (
    <>
      {/* Step 0: Brief */}
      <fieldset className={cn('space-y-4', step !== 0 && 'hidden')}>
        <legend className="sr-only">Campaign brief</legend>
        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Campaign name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Grab Summer 2026" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="Campaign objective, offer, target audience..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </fieldset>

      {/* Step 1: Creative */}
      <fieldset className={cn('space-y-4', step !== 1 && 'hidden')}>
        <legend className="sr-only">Select creative</legend>
        <FormField
          control={control}
          name="creativeUrls"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Creatives</FormLabel>
              <FormControl>
                <CampaignCreativeUpload value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
              <p className="text-[11px] text-[#666666]">
                Upload one or more decal creative images. Each image is one creative.
              </p>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="qrTargetUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>QR target URL</FormLabel>
              <FormControl>
                <Input type="url" placeholder="https://your-brand.vn/campaign" {...field} />
              </FormControl>
              <FormMessage />
              <p className="text-[11px] text-[#666666]">
                Put the landing page that the decal QR should open. This belongs with the creative
                step.
              </p>
            </FormItem>
          )}
        />
      </fieldset>

      {/* Step 2: Budget */}
      <fieldset className={cn('space-y-4', step !== 2 && 'hidden')}>
        <legend className="sr-only">Campaign budget</legend>
        <div className="rounded-md border border-[#cbccc9] bg-[#f7f8fa] p-4">
          <p className="text-[11px] font-bold tracking-[2px] text-[#ff5c00] uppercase">
            Locked plan
          </p>
          <p className="font-heading mt-1 text-[22px] text-[#1a1a1a] uppercase">
            {DEFAULT_CAMPAIGN_PLAN.label}
          </p>
          <div className="mt-3 grid grid-cols-3 gap-3 text-[12px]">
            <Stat label="Duration" value={`${DEFAULT_CAMPAIGN_PLAN.durationMonths} months`} />
            <Stat label="Drivers" value={`${DEFAULT_CAMPAIGN_PLAN.driverCount}`} />
            <Stat
              label="Plan budget"
              value={formatVnd(
                calculateDriverMonthlyBudgetVnd(DEFAULT_CAMPAIGN_PLAN.driverCount) *
                  DEFAULT_CAMPAIGN_PLAN.durationMonths,
              )}
            />
          </div>
          <p className="mt-3 text-[11px] text-[#666666]">
            Budget follows the pilot plan automatically. No manual monthly cap selection.
          </p>
        </div>
        <CampaignBudgetHint
          values={{
            name: getValues('name'),
            description: getValues('description'),
            startDate: getValues('startDate'),
            endDate: getValues('endDate'),
            creativeUrls: getValues('creativeUrls'),
            planPackage: getValues('planPackage'),
            driverCount: getValues('driverCount'),
            qrTargetUrl: getValues('qrTargetUrl'),
          }}
        />
      </fieldset>

      {/* Step 3: Review */}
      {step === 3 && <ReviewSummary getValues={getValues} />}
    </>
  )
}

function ReviewSummary({ getValues }: { getValues: (key: keyof WizardFormValues) => string }) {
  const rows: [string, string][] = [
    ['Name', getValues('name')],
    ['Description', getValues('description')],
    ['Dates', `${getValues('startDate')} → ${getValues('endDate')}`],
    ['Creatives', `${getValues('creativeUrls').split(/\n|,/).filter(Boolean).length}`],
    [
      'Plan',
      `${DEFAULT_CAMPAIGN_PLAN.label} · ${DEFAULT_CAMPAIGN_PLAN.durationMonths} months · ${DEFAULT_CAMPAIGN_PLAN.driverCount} drivers`,
    ],
    [
      'Plan monthly budget',
      formatVnd(calculateDriverMonthlyBudgetVnd(DEFAULT_CAMPAIGN_PLAN.driverCount)),
    ],
    ['QR URL', getValues('qrTargetUrl')],
  ]

  return (
    <div className="space-y-3 rounded-md border border-[#cbccc9] bg-[#f7f8fa] p-4">
      <p className="text-[11px] font-extrabold tracking-[2.5px] text-[#666666] uppercase">
        Summary
      </p>
      {rows.map(([label, val]) => (
        <div key={label} className="flex justify-between text-[13px]">
          <span className="text-[#666666]">{label}</span>
          <span className="font-bold text-[#1a1a1a]">{val}</span>
        </div>
      ))}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-[#e5e5e2] bg-white p-2">
      <p className="text-[10px] font-bold tracking-[1px] text-[#666666] uppercase">{label}</p>
      <p className="mt-0.5 font-mono text-[12px] font-bold text-[#1a1a1a]">{value}</p>
    </div>
  )
}
