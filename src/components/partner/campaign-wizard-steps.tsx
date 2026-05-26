'use client'

/**
 * CampaignWizardSteps — step field panels for CampaignFormWizard.
 * Extracted to keep wizard under 200 lines.
 */
import type { Control } from 'react-hook-form'

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

export interface WizardFormValues {
  name: string
  districts: string
  startDate: string
  endDate: string
  creativeId: string
  targetKm: string
  budgetVnd: string
}

interface StepFieldsProps {
  step: number
  control: Control<WizardFormValues>
  getValues: (key: keyof WizardFormValues) => string
}

export function WizardStepFields({ step, control, getValues }: StepFieldsProps) {
  if (step === 0) {
    return (
      <fieldset className="space-y-4">
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
    )
  }

  if (step === 1) {
    return (
      <fieldset className="space-y-4">
        <legend className="sr-only">Select creative</legend>
        <FormField
          control={control}
          name="creativeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Creative asset ID</FormLabel>
              <FormControl>
                <Input placeholder="e.g. asset-001" {...field} />
              </FormControl>
              <FormMessage />
              <p className="text-[11px] text-[#666666]">
                Enter the ID of an approved creative from your Creatives library.
              </p>
            </FormItem>
          )}
        />
      </fieldset>
    )
  }

  if (step === 2) {
    return (
      <fieldset className="space-y-4">
        <legend className="sr-only">Campaign budget</legend>
        <FormField
          control={control}
          name="targetKm"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target km</FormLabel>
              <FormControl>
                <Input type="number" min={1000} step={1000} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="budgetVnd"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Budget (₫)</FormLabel>
              <FormControl>
                <Input type="number" min={1_000_000} step={500_000} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </fieldset>
    )
  }

  // Step 3: Review
  const rows: [string, string][] = [
    ['Name', getValues('name')],
    ['Districts', getValues('districts')],
    ['Dates', `${getValues('startDate')} → ${getValues('endDate')}`],
    ['Creative', getValues('creativeId')],
    ['Target km', Number(getValues('targetKm')).toLocaleString('vi-VN')],
    ['Budget', `₫${Number(getValues('budgetVnd')).toLocaleString('vi-VN')}`],
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
