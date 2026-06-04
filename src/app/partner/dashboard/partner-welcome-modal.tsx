'use client'

import { useEffect, useState } from 'react'

import { X } from 'lucide-react'

export function PartnerWelcomeModal({ partnerId }: { partnerId: string }) {
  const storageKey = `partner-welcome-seen:${partnerId}`
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (window.localStorage.getItem(storageKey) === 'true') return
    const timer = window.setTimeout(() => setOpen(true), 0)
    return () => window.clearTimeout(timer)
  }, [storageKey])

  function close() {
    window.localStorage.setItem(storageKey, 'true')
    setOpen(false)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="partner-welcome-title"
        className="relative w-full max-w-lg rounded-md border border-[#cbccc9] bg-white p-6 shadow-xl"
      >
        <button
          type="button"
          onClick={close}
          className="absolute top-3 right-3 rounded p-1 text-[#666666] hover:bg-[#f0f0ee]"
          aria-label="Close welcome modal"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
        <p className="text-[11px] font-bold tracking-[2.5px] text-[#ff5c00] uppercase">
          Chào mừng đến với VehicleAdvertise
        </p>
        <h2 id="partner-welcome-title" className="font-heading mt-2 text-[34px] leading-none">
          Start Your Campaign
        </h2>
        <ol className="mt-5 space-y-3 text-[14px] text-[#1a1a1a]">
          {[
            'Nạp tối thiểu 10.000.000 VNĐ',
            'Tạo Campaign',
            'Thiết lập số lượng Driver',
            'Upload Creative',
            'Publish Campaign',
          ].map((item, index) => (
            <li key={item} className="flex gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#1a1a1a] text-[11px] font-bold text-white">
                {index + 1}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
        <button
          type="button"
          onClick={close}
          className="mt-6 h-11 rounded bg-[#ff5c00] px-5 text-[12px] font-bold tracking-[1px] text-white uppercase hover:bg-[#e05200]"
        >
          Got it
        </button>
      </section>
    </div>
  )
}
