'use client'

/**
 * KycWizard — client component.
 * 3-step state machine: CCCD upload → Selfie → Vehicle photos.
 * File inputs use camera capture on mobile. Mock submit via sonner toast.
 */
import { useRef, useState } from 'react'

import { toast } from 'sonner'

import { Button } from '@/components/ui/button'

type Step = 1 | 2 | 3

const STEPS = [
  { label: 'CCCD', description: 'Upload your national ID (front & back)' },
  { label: 'Selfie', description: 'Take a clear selfie holding your CCCD' },
  { label: 'Vehicle', description: 'Upload 4 angles of your vehicle with ad installed' },
]

interface FileState {
  cccdFront: File | null
  cccdBack: File | null
  selfie: File | null
  vehicleFront: File | null
  vehicleBack: File | null
  vehicleLeft: File | null
  vehicleRight: File | null
}

const INITIAL_FILES: FileState = {
  cccdFront: null,
  cccdBack: null,
  selfie: null,
  vehicleFront: null,
  vehicleBack: null,
  vehicleLeft: null,
  vehicleRight: null,
}

function StepIndicator({ current, total }: { current: Step; total: number }) {
  return (
    <div
      className="mb-6 flex items-center gap-2"
      role="status"
      aria-label={`Step ${current} of ${total}`}
    >
      {Array.from({ length: total }, (_, i) => {
        const stepNum = (i + 1) as Step
        const done = stepNum < current
        const active = stepNum === current
        return (
          <div key={stepNum} className="flex items-center gap-2">
            <div
              className={[
                'flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-bold transition-colors',
                active
                  ? 'bg-primary text-white'
                  : done
                    ? 'bg-primary/20 text-primary'
                    : 'bg-[#f0f0ee] text-[#666666]',
              ].join(' ')}
              aria-current={active ? 'step' : undefined}
            >
              {done ? '✓' : stepNum}
            </div>
            {i < total - 1 && (
              <div
                className={[
                  'h-[2px] w-12 transition-colors',
                  done ? 'bg-primary' : 'bg-[#cbccc9]',
                ].join(' ')}
                aria-hidden="true"
              />
            )}
          </div>
        )
      })}
      <p className="ml-2 text-[11px] font-bold tracking-[2.5px] text-[#666666] uppercase">
        {current}/{total} — {STEPS[current - 1].label}
      </p>
    </div>
  )
}

function FileInput({
  id,
  label,
  file,
  onChange,
}: {
  id: string
  label: string
  file: File | null
  onChange: (f: File) => void
}) {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-[11px] font-bold tracking-[2.5px] text-[#666666] uppercase"
      >
        {label}
      </label>
      <button
        type="button"
        onClick={() => ref.current?.click()}
        className={[
          'flex h-[56px] w-full items-center justify-center rounded-md border text-[13px] font-medium transition-colors',
          'focus-visible:ring-primary focus-visible:ring-2 focus-visible:outline-none',
          file
            ? 'border-primary/40 bg-primary/5 text-primary'
            : 'border-[#cbccc9] bg-[#f7f8fa] text-[#666666] hover:border-[#1a1a1a]',
        ].join(' ')}
        aria-label={file ? `${label}: ${file.name} — tap to change` : `Upload ${label}`}
      >
        {file ? `✓ ${file.name}` : `Tap to upload ${label}`}
      </button>
      <input
        ref={ref}
        id={id}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onChange(f)
        }}
      />
    </div>
  )
}

export function KycWizard() {
  const [step, setStep] = useState<Step>(1)
  const [files, setFiles] = useState<FileState>(INITIAL_FILES)
  const [submitting, setSubmitting] = useState(false)

  const set = (key: keyof FileState) => (f: File) => setFiles((prev) => ({ ...prev, [key]: f }))

  const canNext1 = files.cccdFront && files.cccdBack
  const canNext2 = files.selfie
  const canSubmit =
    files.vehicleFront && files.vehicleBack && files.vehicleLeft && files.vehicleRight

  async function handleSubmit() {
    setSubmitting(true)
    // Stub: log files and show toast. Real impl posts to Supabase Storage via signed URL.
    console.log('[KycWizard] submit', files)
    await new Promise((r) => setTimeout(r, 800))
    setSubmitting(false)
    toast.success("KYC submitted for review. We'll notify you within 24 hours.")
  }

  return (
    <div className="w-full">
      <StepIndicator current={step} total={3} />

      <p className="mb-6 text-[14px] text-[#666666]">{STEPS[step - 1].description}</p>

      {step === 1 && (
        <div className="space-y-4">
          <FileInput
            id="cccd-front"
            label="CCCD Front"
            file={files.cccdFront}
            onChange={set('cccdFront')}
          />
          <FileInput
            id="cccd-back"
            label="CCCD Back"
            file={files.cccdBack}
            onChange={set('cccdBack')}
          />
          <Button
            className="mt-2 h-12 w-full text-[13px] font-bold tracking-[1px] uppercase"
            disabled={!canNext1}
            onClick={() => setStep(2)}
          >
            Next — Selfie
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <FileInput
            id="selfie"
            label="Selfie with CCCD"
            file={files.selfie}
            onChange={set('selfie')}
          />
          <div className="flex gap-3">
            <Button variant="outline" className="h-12 flex-1" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button
              className="h-12 flex-1 text-[13px] font-bold tracking-[1px] uppercase"
              disabled={!canNext2}
              onClick={() => setStep(3)}
            >
              Next — Vehicle
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <FileInput
            id="vehicle-front"
            label="Front"
            file={files.vehicleFront}
            onChange={set('vehicleFront')}
          />
          <FileInput
            id="vehicle-back"
            label="Back"
            file={files.vehicleBack}
            onChange={set('vehicleBack')}
          />
          <FileInput
            id="vehicle-left"
            label="Left side"
            file={files.vehicleLeft}
            onChange={set('vehicleLeft')}
          />
          <FileInput
            id="vehicle-right"
            label="Right side"
            file={files.vehicleRight}
            onChange={set('vehicleRight')}
          />
          <div className="flex gap-3">
            <Button variant="outline" className="h-12 flex-1" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button
              className="h-12 flex-1 text-[13px] font-bold tracking-[1px] uppercase"
              disabled={!canSubmit || submitting}
              onClick={handleSubmit}
            >
              {submitting ? 'Submitting…' : 'Submit KYC'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
