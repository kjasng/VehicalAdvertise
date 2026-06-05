'use client'

import { useState, useTransition } from 'react'

import { Save } from 'lucide-react'
import { toast } from 'sonner'

import { SectionShell } from '@/components/shared/section-shell'
import type { PricingSettings } from '@/lib/admin/queries-pricing-settings'
import { GARAGE_INSTALL_FEE_VND, formatVnd } from '@/lib/partner/constants'

import { updatePricingSettings } from './actions'

interface Props {
  settings: PricingSettings
}

export function PricingSettingsClient({ settings }: Props) {
  const [pending, startTransition] = useTransition()
  const [form, setForm] = useState({
    garageMinimumWithdrawalVnd: settings.garageMinimumWithdrawalVnd.toLocaleString('vi-VN'),
    partnerMinimumCapVnd: settings.partnerMinimumCapVnd.toLocaleString('vi-VN'),
    platformFeePct: String(settings.platformFeePct),
  })

  function setField(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function moneyValue(value: string) {
    const parsed = parseInt(value.replace(/\D/g, ''), 10)
    return Number.isNaN(parsed) ? 0 : parsed
  }

  function numericValue(value: string) {
    const parsed = Number(value.replace(',', '.'))
    return Number.isNaN(parsed) ? null : parsed
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const platformFeePct = numericValue(form.platformFeePct)

    if (platformFeePct == null) {
      toast.error('Nhập platform fee hợp lệ')
      return
    }

    startTransition(async () => {
      const result = await updatePricingSettings({
        garageMinimumWithdrawalVnd: moneyValue(form.garageMinimumWithdrawalVnd),
        partnerMinimumCapVnd: moneyValue(form.partnerMinimumCapVnd),
        platformFeePct,
      })
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success('Đã cập nhật settings')
    })
  }

  return (
    <SectionShell title="Settings by role">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-3">
          <RoleGroup title="Garage">
            <FixedPricingField
              label="Payout each install"
              value={formatVnd(GARAGE_INSTALL_FEE_VND)}
              helper="Fixed platform policy"
            />
            <PricingField
              id="garage-minimum-withdrawal"
              label="Minimum withdrawal"
              value={form.garageMinimumWithdrawalVnd}
              onChange={(value) => setField('garageMinimumWithdrawalVnd', value)}
              placeholder="2,000,000"
            />
          </RoleGroup>

          <RoleGroup title="Partner">
            <PricingField
              id="partner-minimum-cap"
              label="Minimum cap"
              value={form.partnerMinimumCapVnd}
              onChange={(value) => setField('partnerMinimumCapVnd', value)}
              placeholder="2,000,000"
            />
          </RoleGroup>

          <RoleGroup title="Driver">
            <PricingField
              id="platform-fee"
              label="Platform fee (%)"
              value={form.platformFeePct}
              onChange={(value) => setField('platformFeePct', value)}
              placeholder="20"
              inputMode="decimal"
            />
          </RoleGroup>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[#cbccc9] pt-4">
          <button
            type="submit"
            disabled={pending}
            className="flex items-end justify-end gap-2 rounded bg-[#1a1a1a] px-4 py-2 text-[13px] font-bold text-white hover:bg-[#333] disabled:opacity-50"
          >
            <Save className="size-3.5" aria-hidden="true" />
            {pending ? 'Đang lưu...' : 'Lưu thông số'}
          </button>
        </div>
      </form>
    </SectionShell>
  )
}

function RoleGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-3 rounded-md border border-[#cbccc9] p-4">
      <legend className="text-primary px-1 text-[11px] font-bold tracking-[2.5px] uppercase">
        {title}
      </legend>
      {children}
    </fieldset>
  )
}

function FixedPricingField({
  label,
  value,
  helper,
}: {
  label: string
  value: string
  helper: string
}) {
  return (
    <div className="block space-y-1">
      <span className="text-[11px] font-bold tracking-[2px] text-[#666666] uppercase">{label}</span>
      <div className="rounded border border-[#cbccc9] bg-[#f7f8fa] px-3 py-2.5 font-mono text-[14px] font-bold text-[#1a1a1a]">
        {value}
      </div>
      <p className="text-[11px] text-[#666666]">{helper}</p>
    </div>
  )
}

function PricingField({
  id,
  label,
  value,
  onChange,
  placeholder,
  inputMode = 'numeric',
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
}) {
  return (
    <label htmlFor={id} className="block space-y-1">
      <span className="text-[11px] font-bold tracking-[2px] text-[#666666] uppercase">{label}</span>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="focus:ring-primary h-11 w-full rounded border border-[#cbccc9] px-3 font-mono text-[14px] text-[#1a1a1a] focus:ring-2 focus:outline-none"
        inputMode={inputMode}
        placeholder={placeholder}
      />
    </label>
  )
}
