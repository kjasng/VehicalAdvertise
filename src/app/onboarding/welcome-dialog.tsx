'use client'

import { X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'

// Welcome dialog: shows once on /onboarding mount and blocks panel interaction
// until the user explicitly dismisses it (Got it / X / Escape / backdrop click).
export function WelcomeDialog() {
  const [open, setOpen] = useState(true)
  const confirmRef = useRef<HTMLButtonElement>(null)

  // Auto-focus the primary action when the dialog opens and listen for Escape.
  useEffect(() => {
    if (!open) return
    confirmRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  // Prevent background scroll while the dialog is open.
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
    >
      {/* Backdrop blocks all panel interaction until dismissed. */}
      <button
        type="button"
        aria-label="Dismiss welcome dialog"
        onClick={() => setOpen(false)}
        className="absolute inset-0 cursor-default bg-black/75 backdrop-blur-sm"
      />

      <div className="relative w-full max-w-[480px] rounded-md border border-white/15 bg-[#1a1a1a] px-8 py-10 text-center shadow-[0_30px_80px_#000000bf] lg:px-12 lg:py-12">
        <button
          type="button"
          aria-label="Close"
          onClick={() => setOpen(false)}
          className="hover:text-primary absolute top-4 right-4 text-white/50 transition-colors"
        >
          <X className="size-5" aria-hidden="true" />
        </button>

        <p className="text-primary text-[11px] font-bold tracking-[2.5px] uppercase">
          Welcome · Step 01
        </p>
        <h1
          id="welcome-dialog-title"
          className="font-heading mt-3 text-3xl leading-[0.95] text-white uppercase lg:text-[42px]"
        >
          Pick how you&apos;ll use
          <br />
          <span className="text-primary">Vehical Advertise</span>
        </h1>

        <Button
          ref={confirmRef}
          type="button"
          onClick={() => setOpen(false)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 mt-8 h-12 px-8 text-sm font-bold tracking-wide uppercase"
        >
          Got it
        </Button>
      </div>
    </div>
  )
}
