'use client'

import { useState } from 'react'

import { FilePlus } from 'lucide-react'

import { DriverWithdrawalModal } from '@/components/driver/driver-withdrawal-modal'
import type { DriverBankInfo } from '@/lib/driver/queries-invoices'

interface Props {
  disabled?: boolean
  amountVnd?: number
  periodStart?: string
  periodEnd?: string
  bankInfo?: DriverBankInfo | null
}

export function CreateInvoiceButton({
  disabled,
  amountVnd,
  periodStart,
  periodEnd,
  bankInfo,
}: Props) {
  const [open, setOpen] = useState(false)

  const canOpenModal = !disabled && amountVnd && periodStart && periodEnd && bankInfo

  return (
    <>
      <button
        type="button"
        disabled={!canOpenModal}
        onClick={() => setOpen(true)}
        className="inline-flex h-11 items-center gap-2 rounded bg-[#1a1a1a] px-4 text-[12px] font-bold tracking-[1px] text-white uppercase hover:bg-[#333] disabled:opacity-50"
      >
        <FilePlus className="size-4" aria-hidden="true" />
        Tạo hóa đơn
      </button>

      {open && canOpenModal && (
        <DriverWithdrawalModal
          amountVnd={amountVnd}
          periodStart={periodStart}
          periodEnd={periodEnd}
          bankInfo={bankInfo}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
