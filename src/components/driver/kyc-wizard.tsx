'use client'

/**
 * KycWizard — 3-step KYC onboarding.
 * Step 1: Profile info (name, phone, car type)
 * Step 2: CCCD photos (front + back, with live preview)
 * Step 3: Selfie photo (with live preview) + submit
 * Real upload via submitKyc server action — no base64 in DB.
 */
import { useState, useTransition } from 'react'

import { toast } from 'sonner'

import { submitKyc } from '@/app/driver/verify/actions'
import { Button } from '@/components/ui/button'

import { KycPhotoInput } from './kyc-photo-input'

type Step = 1 | 2 | 3

const STEP_LABELS: Record<Step, string> = {
  1: 'Profile',
  2: 'CCCD',
  3: 'Selfie',
}

const BODY_TYPES = [
  { value: 'sedan', label: 'Sedan' },
  { value: 'suv', label: 'SUV' },
  { value: 'hatchback', label: 'Hatchback' },
  { value: 'mpv', label: 'MPV' },
  { value: 'pickup', label: 'Pickup' },
]

function StepBar({ current }: { current: Step }) {
  return (
    <div className="mb-6 flex items-center gap-2" role="status" aria-label={`Step ${current} of 3`}>
      {([1, 2, 3] as Step[]).map((s, i) => {
        const done = s < current
        const active = s === current
        return (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-bold transition-colors ${active ? 'bg-primary text-white' : done ? 'bg-primary/20 text-primary' : 'bg-[#f0f0ee] text-[#666666]'}`}
              aria-current={active ? 'step' : undefined}
            >
              {done ? '✓' : s}
            </div>
            {i < 2 && (
              <div
                className={`h-[2px] w-10 transition-colors ${done ? 'bg-primary' : 'bg-[#cbccc9]'}`}
              />
            )}
          </div>
        )
      })}
      <p className="ml-2 text-[11px] font-bold tracking-[2.5px] text-[#666666] uppercase">
        {current}/3 — {STEP_LABELS[current]}
      </p>
    </div>
  )
}

export function KycWizard() {
  const [step, setStep] = useState<Step>(1)
  const [pending, startTransition] = useTransition()
  const [submitted, setSubmitted] = useState(false)

  // Step 1 state
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [bodyType, setBodyType] = useState('')

  // Step 2+3 file state
  const [cccdFront, setCccdFront] = useState<File | null>(null)
  const [cccdBack, setCccdBack] = useState<File | null>(null)
  const [selfie, setSelfie] = useState<File | null>(null)

  const canStep2 = fullName.trim().length >= 2 && phone.trim().length > 0 && bodyType !== ''
  const canStep3 = cccdFront !== null && cccdBack !== null
  const canSubmit = selfie !== null

  function handleSubmit() {
    if (!cccdFront || !cccdBack || !selfie) return
    startTransition(async () => {
      const fd = new FormData()
      fd.append('fullName', fullName.trim())
      fd.append('phone', phone.trim())
      fd.append('bodyType', bodyType)
      fd.append('cccdFront', cccdFront)
      fd.append('cccdBack', cccdBack)
      fd.append('selfie', selfie)
      const result = await submitKyc(fd)
      if (result.error) {
        // Phone duplicate — send user back to step 1 to fix it
        if (result.error.includes('điện thoại')) setStep(1)
        toast.error(result.error)
      } else {
        setSubmitted(true)
      }
    })
  }

  // Waiting screen after successful submission
  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-5 py-10 text-center">
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
          <h2 className="font-heading text-[22px] leading-none text-[#1a1a1a] uppercase">
            Đã gửi hồ sơ
          </h2>
          <p className="max-w-[360px] text-[14px] leading-[1.6] text-[#666666]">
            Hồ sơ của bạn đang được xem xét. Chúng tôi sẽ thông báo qua email trong vòng{' '}
            <strong>24 giờ</strong>.
          </p>
        </div>
        <p className="text-[12px] text-[#999]">Bạn có thể đóng trang này.</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <StepBar current={step} />

      {/* Step 1 — Profile info */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="full-name"
              className="text-[11px] font-bold tracking-[2.5px] text-[#666666] uppercase"
            >
              Full name *
            </label>
            <input
              id="full-name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nguyễn Văn A"
              className="focus:ring-primary h-[44px] rounded border border-[#cbccc9] px-3 text-[13px] text-[#1a1a1a] placeholder:text-[#999] focus:ring-2 focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="phone"
              className="text-[11px] font-bold tracking-[2.5px] text-[#666666] uppercase"
            >
              Phone number *
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0912345678"
              maxLength={10}
              className="focus:ring-primary h-[44px] rounded border border-[#cbccc9] px-3 text-[13px] text-[#1a1a1a] placeholder:text-[#999] focus:ring-2 focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="body-type"
              className="text-[11px] font-bold tracking-[2.5px] text-[#666666] uppercase"
            >
              Vehicle type *
            </label>
            <select
              id="body-type"
              value={bodyType}
              onChange={(e) => setBodyType(e.target.value)}
              className="focus:ring-primary h-[44px] rounded border border-[#cbccc9] bg-white px-3 text-[13px] text-[#1a1a1a] focus:ring-2 focus:outline-none"
            >
              <option value="">Select type…</option>
              {BODY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <Button
            className="mt-2 h-12 w-full text-[13px] font-bold tracking-[1px] uppercase"
            disabled={!canStep2}
            onClick={() => setStep(2)}
          >
            Next — CCCD Photos
          </Button>
        </div>
      )}

      {/* Step 2 — CCCD photos */}
      {step === 2 && (
        <div className="space-y-4">
          <p className="text-[13px] text-[#666666]">
            Upload both sides of your CCCD (national ID).
          </p>
          <KycPhotoInput
            id="cccd-front"
            label="CCCD Front *"
            name="cccdFront"
            file={cccdFront}
            onChange={setCccdFront}
          />
          <KycPhotoInput
            id="cccd-back"
            label="CCCD Back *"
            name="cccdBack"
            file={cccdBack}
            onChange={setCccdBack}
          />
          <div className="flex gap-3">
            <Button variant="outline" className="h-12 flex-1" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button
              className="h-12 flex-1 text-[13px] font-bold tracking-[1px] uppercase"
              disabled={!canStep3}
              onClick={() => setStep(3)}
            >
              Next — Selfie
            </Button>
          </div>
        </div>
      )}

      {/* Step 3 — Selfie + submit */}
      {step === 3 && (
        <div className="space-y-4">
          <p className="text-[13px] text-[#666666]">
            Take a clear selfie holding your CCCD next to your face.
          </p>
          <KycPhotoInput
            id="selfie"
            label="Selfie with CCCD *"
            name="selfie"
            file={selfie}
            onChange={setSelfie}
          />
          <div className="flex gap-3">
            <Button variant="outline" className="h-12 flex-1" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button
              className="h-12 flex-1 text-[13px] font-bold tracking-[1px] uppercase"
              disabled={!canSubmit || pending}
              onClick={handleSubmit}
            >
              {pending ? 'Submitting…' : 'Submit KYC'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
