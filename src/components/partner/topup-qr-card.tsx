'use client'

/**
 * TopupQrCard — amount selector + VietQR renderer.
 * Uses qrcode.react. Bank info + memo derived from partner UUID.
 * Submit is stubbed (console.log + toast).
 */
import { useState } from 'react'

import { QRCodeSVG } from 'qrcode.react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

import { MOCK_WALLET } from './mock-data'

const PRESETS = [
  { label: '50K', value: 50_000 },
  { label: '100K', value: 100_000 },
  { label: '500K', value: 500_000 },
  { label: '1M', value: 1_000_000 },
]

function buildVietQrPayload(amountVnd: number, partnerUuid: string): string {
  // VietQR EMV-like string (simplified memo payload for QR display)
  const memo = `TOPUP ${partnerUuid} ${amountVnd}`
  return [
    `Bank: ${MOCK_WALLET.bankName}`,
    `Account: ${MOCK_WALLET.bankAccount}`,
    `Name: ${MOCK_WALLET.accountName}`,
    `Amount: ${amountVnd}`,
    `Memo: ${memo}`,
  ].join('\n')
}

export function TopupQrCard() {
  const [selectedPreset, setSelectedPreset] = useState<number | null>(100_000)
  const [customAmount, setCustomAmount] = useState('')
  const [isCustom, setIsCustom] = useState(false)

  const effectiveAmount = isCustom
    ? Math.max(0, parseInt(customAmount.replace(/\D/g, ''), 10) || 0)
    : (selectedPreset ?? 0)

  const qrValue = buildVietQrPayload(effectiveAmount, MOCK_WALLET.partnerUuid)

  function handleConfirm() {
    if (effectiveAmount < 50_000) {
      toast.error('Minimum top-up is ₫50,000')
      return
    }
    console.log('[TopupQrCard] stub top-up confirm:', {
      effectiveAmount,
      partnerUuid: MOCK_WALLET.partnerUuid,
    })
    toast.success(
      `QR generated for ₫${effectiveAmount.toLocaleString('vi-VN')} — scan to complete transfer`,
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Left: amount selector */}
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

        {/* Ledger explainer */}
        <div className="space-y-1 rounded-md border border-[#cbccc9] bg-[#f7f8fa] p-4 text-[12px] text-[#666666]">
          <p className="text-[11px] font-bold tracking-[1.5px] text-[#1a1a1a] uppercase">
            How it works
          </p>
          <p>1. Scan the QR with your banking app.</p>
          <p>2. Transfer the exact amount shown — memo is pre-filled.</p>
          <p>3. Credits appear in your wallet within 5 minutes via SePay webhook.</p>
          <p>4. Campaign charges are deducted automatically per km driven.</p>
        </div>
      </div>

      {/* Right: QR display */}
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
            <span className="font-mono font-bold text-[#1a1a1a]">{MOCK_WALLET.bankName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#666666]">Account</span>
            <span className="font-mono font-bold text-[#1a1a1a]">{MOCK_WALLET.bankAccount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#666666]">Name</span>
            <span className="max-w-[180px] text-right font-mono font-bold text-[#1a1a1a]">
              {MOCK_WALLET.accountName}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#666666]">Memo</span>
            <span className="font-mono font-bold text-[#ff5c00]">
              TOPUP {MOCK_WALLET.partnerUuid}
            </span>
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
