'use client'

import { useState, useTransition } from 'react'

import { Save } from 'lucide-react'
import { toast } from 'sonner'

import { SectionShell } from '@/components/shared/section-shell'
import type { PricingSettings } from '@/lib/admin/queries-pricing-settings'

import { updatePricingSettings } from './actions'

interface Props {
  settings: PricingSettings
}

export function PricingSettingsClient({ settings }: Props) {
  const [pending, startTransition] = useTransition()
  const [form, setForm] = useState({
    installFeeVnd: settings.installFeeVnd.toLocaleString('vi-VN'),
    partnerMinimumCapVnd: settings.partnerMinimumCapVnd.toLocaleString('vi-VN'),
    baseRatePerKmVnd: settings.baseRatePerKmVnd.toLocaleString('vi-VN'),
    evMultiplier: String(settings.evMultiplier),
    platformFeePct: String(settings.platformFeePct),
    minimumDailyKm: String(settings.minimumDailyKm),
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
    const evMultiplier = numericValue(form.evMultiplier)
    const platformFeePct = numericValue(form.platformFeePct)
    const minimumDailyKm = Math.floor(numericValue(form.minimumDailyKm) ?? -1)

    if (!moneyValue(form.baseRatePerKmVnd) || evMultiplier == null || platformFeePct == null) {
      toast.error('Nhập đầy đủ thông số driver hợp lệ')
      return
    }
    if (minimumDailyKm < 0) {
      toast.error('Nhập minimum daily km hợp lệ')
      return
    }

    startTransition(async () => {
      const result = await updatePricingSettings({
        installFeeVnd: moneyValue(form.installFeeVnd),
        partnerMinimumCapVnd: moneyValue(form.partnerMinimumCapVnd),
        baseRatePerKmVnd: moneyValue(form.baseRatePerKmVnd),
        evMultiplier,
        platformFeePct,
        minimumDailyKm,
      })
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success('Đã cập nhật pricing settings')
    })
  }

  return (
    <SectionShell title="Pricing by role">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-3">
          <RoleGroup title="Garage">
            <PricingField
              id="install-fee"
              label="Payout each install"
              value={form.installFeeVnd}
              onChange={(value) => setField('installFeeVnd', value)}
              placeholder="500,000"
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
              id="driver-rate"
              label="Driver rate / km"
              value={form.baseRatePerKmVnd}
              onChange={(value) => setField('baseRatePerKmVnd', value)}
              placeholder="1,500"
            />
            <PricingField
              id="ev-multiplier"
              label="EV multiplier"
              value={form.evMultiplier}
              onChange={(value) => setField('evMultiplier', value)}
              placeholder="1.3"
              inputMode="decimal"
            />
            <PricingField
              id="platform-fee"
              label="Platform fee (%)"
              value={form.platformFeePct}
              onChange={(value) => setField('platformFeePct', value)}
              placeholder="20"
              inputMode="decimal"
            />
            <PricingField
              id="minimum-daily-km"
              label="Minimum daily km reach"
              value={form.minimumDailyKm}
              onChange={(value) => setField('minimumDailyKm', value)}
              placeholder="0"
            />
          </RoleGroup>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#cbccc9] pt-4">
          <p className="text-[12px] text-[#666666]">
            Current rule effective from <span className="font-mono">{settings.effectiveFrom}</span>
          </p>
          <button
            type="submit"
            disabled={pending}
            className="flex items-center gap-2 rounded bg-[#1a1a1a] px-4 py-2 text-[13px] font-bold text-white hover:bg-[#333] disabled:opacity-50"
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
