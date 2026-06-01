'use client'

/**
 * RejectReasonModal — shared modal for entering rejection reasons.
 * Used in Driver KYC, Partner Approvals, Creatives Review, Photo Verifications.
 */
import { useState } from 'react'

import { AlertTriangle, X } from 'lucide-react'

interface Props {
  title: string
  onConfirm: (reason: string) => void
  onClose: () => void
  pending?: boolean
}

export function RejectReasonModal({ title, onConfirm, onClose, pending }: Props) {
  const [reason, setReason] = useState('')

  function handleConfirm() {
    if (!reason.trim()) return
    onConfirm(reason.trim())
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reject-modal-title"
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-[#cbccc9] px-5 py-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="size-4 text-red-600" aria-hidden="true" />
          </div>
          <h2 id="reject-modal-title" className="flex-1 text-[15px] font-bold text-[#1a1a1a]">
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded p-1 text-[#999] hover:bg-[#f0f0ee] hover:text-[#1a1a1a]"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-3 px-5 py-4">
          <p className="text-[13px] text-[#666666]">
            Vui lòng ghi rõ lý do để người dùng biết cách bổ sung và gửi lại hồ sơ.
          </p>
          <div className="space-y-1">
            <label
              htmlFor="reject-reason-input"
              className="block text-[11px] font-bold tracking-[2px] text-[#666666] uppercase"
            >
              Lý do từ chối *
            </label>
            <textarea
              id="reject-reason-input"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              autoFocus
              placeholder="Ví dụ: Ảnh CCCD không rõ nét, vui lòng chụp lại..."
              className="focus:ring-primary w-full rounded border border-[#cbccc9] px-3 py-2.5 text-[13px] text-[#1a1a1a] placeholder:text-[#bbb] focus:ring-2 focus:outline-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t border-[#cbccc9] px-5 py-4">
          <button
            onClick={onClose}
            className="flex-1 rounded border border-[#cbccc9] py-2 text-[13px] font-medium text-[#666666] hover:bg-[#f7f8fa]"
          >
            Huỷ
          </button>
          <button
            onClick={handleConfirm}
            disabled={pending || !reason.trim()}
            className="flex-1 rounded bg-red-600 py-2 text-[13px] font-bold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {pending ? 'Đang xử lý…' : 'Xác nhận từ chối'}
          </button>
        </div>
      </div>
    </div>
  )
}
