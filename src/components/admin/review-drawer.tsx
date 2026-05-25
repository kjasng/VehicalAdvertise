'use client'

/**
 * ReviewDrawer — slide-in-from-right panel.
 * Props: open, onOpenChange, title, children.
 * Backdrop click closes. Focus-trapped via autoFocus on close button.
 */
import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'

import { X } from 'lucide-react'

import { cn } from '@/lib/utils'

interface ReviewDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: ReactNode
}

export function ReviewDrawer({ open, onOpenChange, title, children }: ReviewDrawerProps) {
  const closeRef = useRef<HTMLButtonElement>(null)

  // Focus the close button when drawer opens
  useEffect(() => {
    if (open) {
      setTimeout(() => closeRef.current?.focus(), 50)
    }
  }, [open])

  // Close on Escape key
  useEffect(() => {
    if (!open) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onOpenChange(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onOpenChange])

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={() => onOpenChange(false)}
        className={cn(
          'fixed inset-0 z-40 bg-black/40 transition-opacity duration-300',
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
        )}
      />

      {/* Drawer panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'fixed inset-y-0 right-0 z-50 flex w-full max-w-[480px] flex-col border-l border-[#cbccc9] bg-white shadow-xl',
          'transition-transform duration-300 ease-out',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#cbccc9] px-6 py-4">
          <h2 className="font-heading text-[22px] leading-none text-[#1a1a1a] uppercase">
            {title}
          </h2>
          <button
            ref={closeRef}
            onClick={() => onOpenChange(false)}
            aria-label="Close drawer"
            className="focus-visible:ring-primary rounded p-1.5 text-[#666666] transition-colors hover:bg-[#f7f8fa] hover:text-[#1a1a1a] focus-visible:ring-2 focus-visible:outline-none"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </>
  )
}
