'use client'

import { AlertTriangle, X } from 'lucide-react'

interface Props {
  title: string
  message: string
  confirmLabel?: string
  variant?: 'danger' | 'warning'
  pending?: boolean
  onConfirm: () => void
  onClose: () => void
}

export function ConfirmModal({
  title,
  message,
  confirmLabel = 'Confirm',
  variant = 'danger',
  pending,
  onConfirm,
  onClose,
}: Props) {
  const confirmCls =
    variant === 'danger'
      ? 'bg-red-600 hover:bg-red-700 text-white'
      : 'bg-yellow-500 hover:bg-yellow-600 text-white'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${variant === 'danger' ? 'bg-red-100' : 'bg-yellow-100'}`}
            >
              <AlertTriangle
                className={`size-4 ${variant === 'danger' ? 'text-red-600' : 'text-yellow-600'}`}
                aria-hidden="true"
              />
            </div>
            <h2 className="text-[15px] font-bold text-[#1a1a1a]">{title}</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="ml-2 rounded p-1 text-[#999] hover:bg-[#f0f0ee] hover:text-[#1a1a1a]"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        <p className="px-5 pt-3 pb-2 text-[13px] leading-[1.6] text-[#666666]">{message}</p>

        {/* Actions */}
        <div className="flex gap-2 px-5 pt-3 pb-5">
          <button
            onClick={onClose}
            className="flex-1 rounded border border-[#cbccc9] py-2 text-[13px] font-medium text-[#666666] hover:bg-[#f7f8fa]"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={pending}
            className={`flex-1 rounded py-2 text-[13px] font-bold transition-colors disabled:opacity-50 ${confirmCls}`}
          >
            {pending ? 'Processing…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
