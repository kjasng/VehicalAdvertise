'use client'

import { useState, useTransition } from 'react'

import { LogOut, Save } from 'lucide-react'
import { toast } from 'sonner'

import { signOutAction } from '@/app/(public)/login/actions'
import { updateDriverProfile } from '@/app/driver/profile/actions'
import type { DriverProfileData } from '@/lib/driver/queries-profile'

type DriverProfileFormState = {
  fullName: string
  phone: string
  bankAccountName: string
  bankAccountNumber: string
  bankName: string
  vehiclePlate: string
}

export function DriverProfileForm({ profile }: { profile: DriverProfileData }) {
  const [pending, startTransition] = useTransition()
  const [form, setForm] = useState<DriverProfileFormState>({
    fullName: profile.fullName,
    phone: profile.phone,
    bankAccountName: profile.bankAccountName,
    bankAccountNumber: profile.bankAccountNumber,
    bankName: profile.bankName,
    vehiclePlate: profile.vehiclePlate,
  })

  function setField(key: keyof DriverProfileFormState, value: string) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const result = await updateDriverProfile({
        ...form,
        vehicleId: profile.vehicleId,
      })
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success('Đã lưu hồ sơ và payout settings')
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Personal">
          <Field
            id="full-name"
            label="Full name"
            value={form.fullName}
            onChange={(value) => setField('fullName', value)}
            autoComplete="name"
          />
          <Field
            id="phone"
            label="Phone number"
            value={form.phone}
            onChange={(value) => setField('phone', value)}
            autoComplete="tel"
            inputMode="numeric"
          />
          <Field
            id="vehicle-plate"
            label="License plate"
            value={form.vehiclePlate}
            onChange={(value) => setField('vehiclePlate', value.toUpperCase())}
            required
          />
          <p className="text-[12px] text-[#666666]">
            Cập nhật biển số xe để có thể được assign vào campaign.
          </p>
        </Panel>

        <Panel title="Payout Settings">
          <Field
            id="bank-account-name"
            label="Account holder"
            value={form.bankAccountName}
            onChange={(value) => setField('bankAccountName', value)}
          />
          <Field
            id="bank-account-number"
            label="Account number"
            value={form.bankAccountNumber}
            onChange={(value) => setField('bankAccountNumber', value)}
            inputMode="numeric"
          />
          <Field
            id="bank-name"
            label="Bank name"
            value={form.bankName}
            onChange={(value) => setField('bankName', value)}
          />
          <p className="text-[12px] text-[#666666]">
            Thay đổi payout settings sẽ cần admin xác minh trước khi duyệt rút tiền.
          </p>
        </Panel>
      </div>

      <div className="flex flex-wrap justify-end gap-3 border-t border-[#cbccc9] pt-4">
        <button
          type="button"
          onClick={() => startTransition(async () => signOutAction())}
          className="flex h-12 items-center gap-2 rounded border border-[#cbccc9] px-6 text-[13px] font-bold tracking-[1px] text-red-600 uppercase hover:bg-red-50"
        >
          <LogOut className="size-4" aria-hidden="true" />
          Sign out
        </button>
        <button
          type="submit"
          disabled={pending}
          className="flex h-12 items-center gap-2 rounded bg-[#1a1a1a] px-8 text-[13px] font-bold tracking-[1px] text-white uppercase hover:bg-[#333] disabled:opacity-50"
        >
          <Save className="size-4" aria-hidden="true" />
          {pending ? 'Saving...' : 'Save changes'}
        </button>
      </div>
    </form>
  )
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-md border border-[#cbccc9] bg-white p-4">
      <h2 className="font-heading text-[24px] leading-none text-[#1a1a1a] uppercase">{title}</h2>
      {children}
    </section>
  )
}

function Field({
  id,
  label,
  value,
  onChange,
  inputMode,
  autoComplete,
  required = true,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
  autoComplete?: string
  required?: boolean
}) {
  return (
    <label htmlFor={id} className="block space-y-1">
      <span className="text-[11px] font-bold tracking-[2.5px] text-[#666666] uppercase">
        {label}
        {required ? ' *' : ''}
      </span>
      <input
        id={id}
        value={value}
        required={required}
        inputMode={inputMode}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className="focus:ring-primary h-12 w-full rounded border border-[#cbccc9] px-3 text-[13px] text-[#1a1a1a] focus:ring-2 focus:outline-none"
      />
    </label>
  )
}
