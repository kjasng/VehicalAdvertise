'use client'

import Image from 'next/image'
import { X } from 'lucide-react'

import { formatVnd } from '@/lib/partner/constants'
import { cn } from '@/lib/utils'

type PlanCheckoutModalProps = {
  open: boolean
  planName: string
  planLabel: string
  drivers: number
  amountVnd: number
  qrImageUrl: string | null
  bankName: string
  bankAccount: string
  accountName: string
  memo: string
  onClose: () => void
}

export function PlanCheckoutModal({
  open,
  planName,
  planLabel,
  drivers,
  amountVnd,
  qrImageUrl,
  bankName,
  bankAccount,
  accountName,
  memo,
  onClose,
}: PlanCheckoutModalProps) {
  if (!open) return null

  const rows = [
    ['Bank', bankName],
    ['Account', bankAccount],
    ['Name', accountName],
    ['Memo', memo || 'MST chưa cập nhật'],
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="plan-checkout-title"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-[760px] rounded-md border border-[#cbccc9] bg-white p-5 shadow-xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#cbccc9] pb-4">
          <div>
            <p className="text-[11px] font-bold tracking-[2px] text-[#ff5c00] uppercase">
              Checkout
            </p>
            <h2 id="plan-checkout-title" className="font-heading text-[42px] leading-none">
              {planName}
            </h2>
            <p className="mt-1 text-[13px] text-[#666666]">
              {planLabel} · {drivers} drivers
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-[#cbccc9] p-2 text-[#1a1a1a] hover:bg-[#f7f8fa]"
            aria-label="Close checkout"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        <div className="grid gap-5 pt-5 md:grid-cols-[1fr_240px]">
          <div className="space-y-4">
            <div className="rounded-md border border-[#cbccc9] bg-[#f7f8fa] p-4">
              <p className="text-[11px] font-bold tracking-[2px] text-[#666666] uppercase">
                Amount
              </p>
              <p className="mt-2 font-mono text-[28px] font-extrabold text-[#1a1a1a]">
                {formatVnd(amountVnd)}
              </p>
            </div>

            <div className="space-y-2 text-[12px]">
              {rows.map(([label, value]) => (
                <div
                  key={label}
                  className="flex justify-between gap-3 border-b border-[#cbccc9] pb-2"
                >
                  <span className="text-[#666666]">{label}</span>
                  <span
                    className={cn(
                      'text-right font-mono font-bold text-[#1a1a1a]',
                      label === 'Memo' && 'text-[#ff5c00]',
                    )}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center justify-center rounded-md border border-[#cbccc9] bg-[#f7f8fa] p-4">
            {qrImageUrl ? (
              <Image
                src={qrImageUrl}
                width={200}
                height={200}
                unoptimized
                className="size-[200px]"
                alt={`QR payment for ${planName}`}
              />
            ) : (
              <div className="flex size-[200px] items-center justify-center rounded-md bg-white text-center text-[12px] text-[#666666]">
                Missing tax code
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
