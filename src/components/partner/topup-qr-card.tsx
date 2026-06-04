'use client'

import { useState } from 'react'

import { QRCodeSVG } from 'qrcode.react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PARTNER_MIN_DEPOSIT_VND } from '@/lib/partner/constants'
import { cn } from '@/lib/utils'

const PRESETS = [
  { label: '10M', value: 10_000_000 },
  { label: '30M', value: 30_000_000 },
  { label: '50M', value: 50_000_000 },
  { label: '100M', value: 100_000_000 },
]

type TopupQrCardProps = {
  partnerId: string
  bankName?: string
  bankAccount?: string
  accountName?: string
}

function buildVietQrPayload({
  amountVnd,
  partnerId,
  bankName,
  bankAccount,
  accountName,
}: {
  amountVnd: number
  partnerId: string
  bankName: string
  bankAccount: string
  accountName: string
}): string {
  // VietQR EMV-like string (simplified memo payload for QR display)
  const memo = `TOPUP ${partnerId} ${amountVnd}`
  return [
    `Bank: ${bankName}`,
    `Account: ${bankAccount}`,
    `Name: ${accountName}`,
    `Amount: ${amountVnd}`,
    `Memo: ${memo}`,
  ].join('\n')
}

export function TopupQrCard({
  partnerId,
  bankName = 'VCB',
  bankAccount = '0123456789',
  accountName = 'VEHICAL ADVERTISE JSC',
}: TopupQrCardProps) {
  const [selectedPreset, setSelectedPreset] = useState<number | null>(PARTNER_MIN_DEPOSIT_VND)
  const [customAmount, setCustomAmount] = useState('')
  const [isCustom, setIsCustom] = useState(false)

  const effectiveAmount = isCustom
    ? Math.max(0, parseInt(customAmount.replace(/\D/g, ''), 10) || 0)
    : (selectedPreset ?? 0)

  const qrValue = buildVietQrPayload({
    amountVnd: effectiveAmount,
    partnerId,
    bankName,
    bankAccount,
    accountName,
  })

  function handleConfirm() {
    if (effectiveAmount < PARTNER_MIN_DEPOSIT_VND) {
      toast.error('Số tiền nạp tối thiểu là 10.000.000 VNĐ')
      return
    }
    toast.success(
      `QR generated for ₫${effectiveAmount.toLocaleString('vi-VN')} — scan to complete transfer`,
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-5">
        <div>
          <p className="mb-3 text-[11px] font-bold tracking-[2.5px] text-[#666666] uppercase">
            Select amount
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => {
                  setSelectedPreset(preset.value)
                  setIsCustom(false)
                }}
                className={cn(
                  'rounded-md border px-4 py-3 text-[13px] font-bold transition-colors focus-visible:ring-2 focus-visible:ring-[#ff5c00] focus-visible:outline-none',
                  !isCustom && selectedPreset === preset.value
                    ? 'border-[#ff5c00] bg-[#ff5c00] text-white'
                    : 'border-[#cbccc9] bg-white text-[#1a1a1a] hover:border-[#ff5c00]',
                )}
                aria-pressed={!isCustom && selectedPreset === preset.value}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-[11px] font-bold tracking-[2.5px] text-[#666666] uppercase">
            Custom amount (₫)
          </p>
          <Input
            type="text"
            inputMode="numeric"
            placeholder="e.g. 250000"
            value={customAmount}
            aria-label="Custom top-up amount in VND"
            onFocus={() => setIsCustom(true)}
            onChange={(e) => {
              setIsCustom(true)
              setCustomAmount(e.target.value)
            }}
            className={cn(isCustom && 'border-[#ff5c00] ring-1 ring-[#ff5c00]')}
          />
        </div>

        <Button
          type="button"
          onClick={handleConfirm}
          className="w-full bg-[#ff5c00] text-white hover:bg-[#e05200] focus-visible:ring-[#ff5c00]"
        >
          Generate QR — ₫{effectiveAmount.toLocaleString('vi-VN')}
        </Button>

        <div className="space-y-1 rounded-md border border-[#cbccc9] bg-[#f7f8fa] p-4 text-[12px] text-[#666666]">
          <p className="text-[11px] font-bold tracking-[1.5px] text-[#1a1a1a] uppercase">
            How it works
          </p>
          <p>
            Scan with your banking app, transfer the exact amount, and keep the memo. Credits appear
            after SePay/admin confirms the transfer.
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 rounded-md border border-[#cbccc9] bg-white p-6">
        <p className="text-[11px] font-bold tracking-[2.5px] text-[#666666] uppercase">
          Scan to pay
        </p>
        {effectiveAmount > 0 ? (
          <QRCodeSVG
            value={qrValue}
            size={200}
            level="M"
            aria-label={`VietQR code for ₫${effectiveAmount.toLocaleString('vi-VN')}`}
          />
        ) : (
          <div
            className="flex size-[200px] items-center justify-center rounded-md bg-[#f7f8fa] text-[12px] text-[#666666]"
            aria-label="Select an amount to generate QR"
          >
            Select amount first
          </div>
        )}
        <div className="w-full space-y-1 text-[12px]">
          <div className="flex justify-between">
            <span className="text-[#666666]">Bank</span>
            <span className="font-mono font-bold text-[#1a1a1a]">{bankName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#666666]">Account</span>
            <span className="font-mono font-bold text-[#1a1a1a]">{bankAccount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#666666]">Name</span>
            <span className="max-w-[180px] text-right font-mono font-bold text-[#1a1a1a]">
              {accountName}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#666666]">Memo</span>
            <span className="font-mono font-bold text-[#ff5c00]">TOPUP {partnerId}</span>
          </div>
          <div className="flex justify-between border-t border-[#cbccc9] pt-2">
            <span className="text-[#666666]">Amount</span>
            <span className="font-heading text-[20px] leading-none text-[#1a1a1a]">
              ₫{effectiveAmount.toLocaleString('vi-VN')}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
