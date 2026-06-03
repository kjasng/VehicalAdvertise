'use client'

import { useTransition } from 'react'

import { FilePlus } from 'lucide-react'
import { toast } from 'sonner'

import { createDriverWithdrawalInvoice } from '@/app/driver/invoice/actions'

export function CreateInvoiceButton({ disabled }: { disabled?: boolean }) {
  const [pending, startTransition] = useTransition()

  return (
    <button
      type="button"
      disabled={disabled || pending}
      onClick={() =>
        startTransition(async () => {
          const result = await createDriverWithdrawalInvoice()
          if (result.error) {
            toast.error(result.error)
            return
          }
          toast.success('Invoice request created')
        })
      }
      className="inline-flex h-11 items-center gap-2 rounded bg-[#1a1a1a] px-4 text-[12px] font-bold tracking-[1px] text-white uppercase hover:bg-[#333] disabled:opacity-50"
    >
      <FilePlus className="size-4" aria-hidden="true" />
      {pending ? 'Creating...' : 'Create invoice'}
    </button>
  )
}
