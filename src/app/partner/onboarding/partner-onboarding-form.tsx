'use client'

/**
 * PartnerOnboardingForm — client component for partner company profile submission.
 * Renders different states: form (new/rejected) or waiting (pending).
 */
import { useState, useTransition } from 'react'

import { AlertTriangle, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

import { submitPartnerProfile } from './actions'

interface Props {
  status: 'none' | 'pending' | 'rejected'
  rejectReason: string | null
  existingData: { companyName: string; taxCode: string; billingAddress: string } | null
}

export function PartnerOnboardingForm({ status, rejectReason, existingData }: Props) {
  const [pending, startTransition] = useTransition()
  const [submitted, setSubmitted] = useState(false)
  const [companyName, setCompanyName] = useState(existingData?.companyName ?? '')
  const [taxCode, setTaxCode] = useState(existingData?.taxCode ?? '')
  const [billingAddress, setBillingAddress] = useState(existingData?.billingAddress ?? '')

  // Shared waiting screen — shown when pending from DB (reload) or right after submit
  const WaitingScreen = (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
        <svg
          className="size-8 text-green-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <div className="space-y-2">
        <h2 className="font-heading text-[24px] text-[#1a1a1a] uppercase">Đã gửi hồ sơ</h2>
        <p className="max-w-[400px] text-[14px] leading-[1.6] text-[#666666]">
          Hồ sơ công ty của bạn đang được xem xét. Chúng tôi sẽ gửi email thông báo trong vòng{' '}
          <strong>24 giờ</strong>.
        </p>
      </div>
      <p className="text-[12px] text-[#999]">Bạn có thể đóng trang này.</p>
    </div>
  )

  if (status === 'pending' || submitted) return WaitingScreen

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const result = await submitPartnerProfile({ companyName, taxCode, billingAddress })
      if (result.error) toast.error(result.error)
      else setSubmitted(true)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-[520px] space-y-6">
      <div>
        <h1 className="font-heading text-[28px] leading-none text-[#1a1a1a] uppercase">
          Đăng ký đối tác
        </h1>
        <p className="mt-2 text-[13px] text-[#666666]">
          Điền thông tin công ty để được xét duyệt. Sau khi duyệt, bạn có thể tạo chiến dịch.
        </p>
      </div>

      {status === 'rejected' && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-600" aria-hidden="true" />
          <div>
            <p className="text-[13px] font-bold text-red-700">Hồ sơ bị từ chối</p>
            {rejectReason && <p className="mt-0.5 text-[12px] text-red-600">{rejectReason}</p>}
            <p className="mt-1 text-[12px] text-red-600">Vui lòng chỉnh sửa và gửi lại.</p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold tracking-[2px] text-[#666666] uppercase">
            Tên công ty *
          </label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
            placeholder="Công ty TNHH ABC"
            className="focus:ring-primary h-[42px] w-full rounded border border-[#cbccc9] px-3 text-[13px] text-[#1a1a1a] placeholder:text-[#bbb] focus:ring-2 focus:outline-none"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold tracking-[2px] text-[#666666] uppercase">
            Mã số thuế *
          </label>
          <input
            type="text"
            value={taxCode}
            onChange={(e) => setTaxCode(e.target.value)}
            required
            placeholder="0123456789"
            maxLength={13}
            className="focus:ring-primary h-[42px] w-full rounded border border-[#cbccc9] px-3 text-[13px] text-[#1a1a1a] placeholder:text-[#bbb] focus:ring-2 focus:outline-none"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold tracking-[2px] text-[#666666] uppercase">
            Địa chỉ xuất hóa đơn *
          </label>
          <textarea
            value={billingAddress}
            onChange={(e) => setBillingAddress(e.target.value)}
            required
            rows={3}
            placeholder="Số 1, Đường ABC, Quận Hoàn Kiếm, Hà Nội"
            className="focus:ring-primary w-full rounded border border-[#cbccc9] px-3 py-2.5 text-[13px] text-[#1a1a1a] placeholder:text-[#bbb] focus:ring-2 focus:outline-none"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded bg-[#1a1a1a] py-3 text-[13px] font-bold text-white hover:bg-[#333] disabled:opacity-50"
      >
        <CheckCircle className="size-4" aria-hidden="true" />
        {pending ? 'Đang gửi…' : status === 'rejected' ? 'Gửi lại hồ sơ' : 'Gửi hồ sơ'}
      </button>
    </form>
  )
}
