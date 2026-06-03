'use client'

import { Printer } from 'lucide-react'

export function PrintPageButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex h-10 items-center gap-2 rounded bg-[#1a1a1a] px-3 text-[12px] font-bold tracking-[1px] text-white uppercase hover:bg-[#333]"
    >
      <Printer className="size-4" aria-hidden="true" />
      Print
    </button>
  )
}
