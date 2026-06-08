'use client'

/**
 * PartnerOnboardingForm — client component for partner company profile submission.
 * Renders different states: form (new/rejected) or waiting (pending).
 */
import { useState, useTransition } from 'react'

import { useRouter } from 'next/navigation'

import { AlertTriangle, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

import { submitPartnerProfile } from './actions'

interface Props {
  status: 'none' | 'rejected'
  rejectReason: string | null
  existingData: {
    companyName: string
    taxCode: string
    billingAddress: string
    contactName: string
    contactPhone: string
  } | null
}

export function PartnerOnboardingForm({ status, rejectReason, existingData }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [companyName, setCompanyName] = useState(existingData?.companyName ?? '')
  const [taxCode, setTaxCode] = useState(existingData?.taxCode ?? '')
  const [billingAddress, setBillingAddress] = useState(existingData?.billingAddress ?? '')
  const [contactName, setContactName] = useState(existingData?.contactName ?? '')
  const [contactPhone, setContactPhone] = useState(existingData?.contactPhone ?? '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const result = await submitPartnerProfile({
        companyName,
        taxCode,
        billingAddress,
        contactName,
        contactPhone,
      })
      if (result.error) {
        toast.error(result.error)
        return
      }
      // Onboarding auto-approves — go straight to the dashboard, no waiting screen.
      toast.success('Hồ sơ đã được duyệt. Chào mừng bạn!')
      router.replace('/partner/dashboard')
      router.refresh()
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
            Địa chỉ công ty *
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

        {/* Contact info */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold tracking-[2px] text-[#666666] uppercase">
              Người liên hệ *
            </label>
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              required
              placeholder="Nguyễn Văn A"
              className="focus:ring-primary h-[42px] w-full rounded border border-[#cbccc9] px-3 text-[13px] text-[#1a1a1a] placeholder:text-[#bbb] focus:ring-2 focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold tracking-[2px] text-[#666666] uppercase">
              Số điện thoại *
            </label>
            <input
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              required
              placeholder="0912345678"
              maxLength={10}
              className="focus:ring-primary h-[42px] w-full rounded border border-[#cbccc9] px-3 text-[13px] text-[#1a1a1a] placeholder:text-[#bbb] focus:ring-2 focus:outline-none"
            />
          </div>
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
