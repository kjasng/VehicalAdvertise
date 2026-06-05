'use client'

import { useState, useTransition } from 'react'

import { Save } from 'lucide-react'
import { toast } from 'sonner'

import { updateGarageProfile } from '@/app/garage/payout/actions'
import type { GarageProfile } from '@/lib/garage/types'

import { Field, Panel } from './garage-form-fields'

type FormState = {
  shopName: string
  address: string
  contactName: string
  phone: string
  serviceArea: string
  googleMapsUrl: string
  workingHours: string
  bankAccountName: string
  bankAccountNumber: string
  bankName: string
}

export function GaragePayoutSettingsForm({ profile }: { profile: GarageProfile }) {
  const [pending, startTransition] = useTransition()
  const [form, setForm] = useState<FormState>({
    shopName: profile.shopName,
    address: profile.address,
    contactName: profile.contactName,
    phone: profile.phone,
    serviceArea: profile.serviceArea,
    googleMapsUrl: profile.googleMapsUrl,
    workingHours: profile.workingHours,
    bankAccountName: profile.bankAccountName,
    bankAccountNumber: profile.bankAccountNumber,
    bankName: profile.bankName,
  })

  function setField(key: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const result = await updateGarageProfile(form)
      if (result.error) toast.error(result.error)
      else toast.success('Đã lưu garage profile và payout settings')
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Garage">
          <Field
            id="garage-name"
            label="Garage name"
            value={form.shopName}
            onChange={(value) => setField('shopName', value)}
          />
          <Field
            id="garage-address"
            label="Address"
            value={form.address}
            onChange={(value) => setField('address', value)}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              id="garage-contact"
              label="Contact person"
              value={form.contactName}
              onChange={(value) => setField('contactName', value)}
              required={false}
            />
            <Field
              id="garage-phone"
              label="Phone"
              value={form.phone}
              onChange={(value) => setField('phone', value)}
              required={false}
            />
          </div>
          <Field
            id="service-area"
            label="Service area"
            value={form.serviceArea}
            onChange={(value) => setField('serviceArea', value)}
            required={false}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              id="maps-url"
              label="Google Maps URL"
              value={form.googleMapsUrl}
              onChange={(value) => setField('googleMapsUrl', value)}
              required={false}
            />
            <Field
              id="working-hours"
              label="Working hours"
              value={form.workingHours}
              onChange={(value) => setField('workingHours', value)}
              required={false}
            />
          </div>
        </Panel>

        <Panel title="Payout Settings">
          <Field
            id="bank-holder"
            label="Account holder"
            value={form.bankAccountName}
            onChange={(value) => setField('bankAccountName', value)}
            required={false}
          />
          <Field
            id="bank-number"
            label="Account number"
            value={form.bankAccountNumber}
            onChange={(value) => setField('bankAccountNumber', value)}
            required={false}
          />
          <Field
            id="bank-name"
            label="Bank name"
            value={form.bankName}
            onChange={(value) => setField('bankName', value)}
            required={false}
          />

          <p className="text-[12px] text-[#666666]">
            Có thể rút sau khi lưu đủ thông tin ngân hàng.
          </p>
        </Panel>
      </div>

      <div className="flex justify-end border-t border-[#cbccc9] pt-4">
        <button
          type="submit"
          disabled={pending}
          className="flex h-11 items-center gap-2 rounded bg-[#1a1a1a] px-5 text-[13px] font-bold text-white hover:bg-[#333] disabled:opacity-50"
        >
          <Save className="size-4" aria-hidden="true" />
          {pending ? 'Saving...' : 'Save settings'}
        </button>
      </div>
    </form>
  )
}
