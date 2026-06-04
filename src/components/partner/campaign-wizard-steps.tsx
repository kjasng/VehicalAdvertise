'use client'

/**
 * CampaignWizardSteps — step field panels for CampaignFormWizard.
 *
 * All panels stay mounted and inactive ones are hidden via CSS, so values
 * (including uploaded creatives) survive Back/Next navigation. Unmounting the
 * inputs would drop their react-hook-form Controller values.
 */
import type { Control } from 'react-hook-form'

import { CampaignCreativeUpload } from '@/components/partner/campaign-creative-upload'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export interface WizardFormValues {
  name: string
  description: string
  districts: string
  startDate: string
  endDate: string
  creativeUrls: string
  driverCount: string
  monthlyCapVnd: string
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
        <FormField
          control={control}
          name="districts"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Districts (comma-separated)</FormLabel>
              <FormControl>
                <Input placeholder="Hoàn Kiếm, Đống Đa, Ba Đình" {...field} />
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
      </fieldset>

      {/* Step 2: Budget */}
      <fieldset className={cn('space-y-4', step !== 2 && 'hidden')}>
        <legend className="sr-only">Campaign budget</legend>
        <FormField
          control={control}
          name="driverCount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Drivers</FormLabel>
              <FormControl>
                <Input type="number" min={1} step={1} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="monthlyCapVnd"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monthly Cap (₫)</FormLabel>
              <FormControl>
                <Input type="number" min={1_100_000} step={100_000} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="qrTargetUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>QR Target URL</FormLabel>
              <FormControl>
                <Input type="url" placeholder="https://your-brand.vn/campaign" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
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
    ['Districts', getValues('districts')],
    ['Dates', `${getValues('startDate')} → ${getValues('endDate')}`],
    ['Creatives', `${getValues('creativeUrls').split(/\n|,/).filter(Boolean).length}`],
    ['Drivers', Number(getValues('driverCount')).toLocaleString('vi-VN')],
    ['Monthly Cap', `₫${Number(getValues('monthlyCapVnd')).toLocaleString('vi-VN')}`],
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
