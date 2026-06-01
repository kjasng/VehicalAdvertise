'use client'

/**
 * UserModal — create (2-step: role → details) or edit a user.
 * Edit mode: shows phone field + KYC photos for drivers.
 * Parent passes key={user?.id ?? 'create'} to force re-mount on user change.
 */
import Image from 'next/image'
import { useState, useTransition } from 'react'

import { Car, Info, Store, X } from 'lucide-react'
import { toast } from 'sonner'

import type { AdminUserRow } from '@/lib/admin/queries-users'

import { createUser, updateUser } from './actions'

type KycPhotos = { front: string | null; back: string | null; selfie: string | null }

const ROLE_META = {
  driver: {
    label: 'Driver',
    icon: Car,
    desc: 'Earn from daily commute with branded vehicle decals.',
    badge: 'bg-blue-100 text-blue-700',
    header: 'bg-blue-50 border-blue-200',
  },
  partner: {
    label: 'Partner',
    icon: Store,
    desc: 'Run advertising campaigns on driver vehicles.',
    badge: 'bg-purple-100 text-purple-700',
    header: 'bg-purple-50 border-purple-200',
  },
  garage: {
    label: 'Garage',
    icon: Store,
    desc: 'Install and manage vehicle decals, get paid weekly.',
    badge: 'bg-orange-100 text-orange-700',
    header: 'bg-orange-50 border-orange-200',
  },
} as const

type EditableRole = keyof typeof ROLE_META

interface Props {
  user?: AdminUserRow | null
  kycPhotos?: KycPhotos | null
  onClose: () => void
}

// ── Edit mode ──────────────────────────────────────────────────────────────

function EditModal({
  user,
  kycPhotos,
  onClose,
}: {
  user: AdminUserRow
  kycPhotos?: KycPhotos | null
  onClose: () => void
}) {
  const [pending, startTransition] = useTransition()
  const [fullName, setFullName] = useState(user.fullName)
  const [phone, setPhone] = useState(user.phone ?? '')
  const [role, setRole] = useState<string>(user.role !== 'admin' ? user.role : 'driver')

  const meta = ROLE_META[role as EditableRole] ?? ROLE_META.driver

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const result = await updateUser({
        targetId: user.id,
        fullName,
        phone: phone || undefined,
        role,
      })
      if (result.error) toast.error(result.error)
      else {
        toast.success(`${fullName} updated`)
        onClose()
      }
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Colored header */}
      <div className={`flex flex-col items-center border-b px-6 py-5 ${meta.header}`}>
        <span
          className={`mb-1.5 rounded-full px-3 py-0.5 text-[11px] font-bold tracking-[2px] uppercase ${meta.badge}`}
        >
          {meta.label}
        </span>
        <h2 className="font-heading text-[22px] leading-none text-[#1a1a1a] uppercase">
          Edit {meta.label}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="focus-visible:ring-primary absolute top-4 right-4 rounded p-1 text-[#666666] transition-colors hover:bg-black/10 focus-visible:ring-2 focus-visible:outline-none"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="max-h-[70vh] space-y-5 overflow-y-auto px-6 py-5">
        {/* Personal info */}
        <div>
          <p className="mb-3 text-[10px] font-bold tracking-[2.5px] text-[#999] uppercase">
            Personal Information
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-[11px] font-bold tracking-[1.5px] text-[#666666] uppercase">
                Full Name *
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="focus:ring-primary h-[38px] w-full rounded border border-[#cbccc9] px-3 text-[13px] focus:ring-2 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-bold tracking-[1.5px] text-[#666666] uppercase">
                Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0912345678"
                className="focus:ring-primary h-[38px] w-full rounded border border-[#cbccc9] px-3 text-[13px] focus:ring-2 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-bold tracking-[1.5px] text-[#666666] uppercase">
                Email
              </label>
              <input
                type="email"
                value={user.email ?? ''}
                disabled
                className="h-[38px] w-full rounded border border-[#cbccc9] bg-[#f7f8fa] px-3 text-[13px] text-[#999]"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-bold tracking-[1.5px] text-[#666666] uppercase">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="focus:ring-primary h-[38px] w-full rounded border border-[#cbccc9] bg-white px-3 text-[13px] focus:ring-2 focus:outline-none"
              >
                {(Object.keys(ROLE_META) as EditableRole[]).map((r) => (
                  <option key={r} value={r}>
                    {ROLE_META[r].label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* KYC photos — drivers only */}
        {user.role === 'driver' && (
          <div>
            <p className="mb-3 text-[10px] font-bold tracking-[2.5px] text-[#999] uppercase">
              KYC Documents
            </p>
            {!kycPhotos || (!kycPhotos.front && !kycPhotos.back && !kycPhotos.selfie) ? (
              <p className="rounded border border-dashed border-[#cbccc9] px-4 py-3 text-center text-[12px] text-[#999]">
                No KYC documents submitted yet
              </p>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'CCCD Front', src: kycPhotos.front },
                    { label: 'CCCD Back', src: kycPhotos.back },
                  ].map(({ label, src }) => (
                    <div key={label} className="space-y-1">
                      <p className="text-[11px] font-medium text-[#666666]">{label}</p>
                      {src ? (
                        <Image
                          src={src}
                          alt={label}
                          width={200}
                          height={130}
                          className="w-full rounded border border-[#cbccc9] object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-[80px] items-center justify-center rounded border border-dashed border-[#cbccc9] text-[11px] text-[#999]">
                          Not uploaded
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {kycPhotos.selfie && (
                  <div className="space-y-1">
                    <p className="text-[11px] font-medium text-[#666666]">Selfie with CCCD</p>
                    <Image
                      src={kycPhotos.selfie}
                      alt="Selfie"
                      width={200}
                      height={150}
                      className="w-full max-w-[200px] rounded border border-[#cbccc9] object-cover"
                      unoptimized
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-3 border-t border-[#cbccc9] px-6 py-4">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 rounded border border-[#cbccc9] py-2 text-[13px] font-medium text-[#666666] hover:bg-[#f7f8fa]"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={pending}
          className="flex-1 rounded bg-[#1a1a1a] py-2 text-[13px] font-bold text-white hover:bg-[#333] disabled:opacity-50"
        >
          {pending ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}

// ── Create mode (2-step) ───────────────────────────────────────────────────

function CreateModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<1 | 2>(1)
  const [selectedRole, setSelectedRole] = useState<EditableRole | null>(null)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pending, startTransition] = useTransition()

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedRole) return
    startTransition(async () => {
      const result = await createUser({ email, fullName, role: selectedRole, password })
      if (result.error) toast.error(result.error)
      else {
        toast.success(`${fullName} created`)
        onClose()
      }
    })
  }

  return (
    <>
      {/* Header */}
      <div className="flex flex-col items-center border-b border-[#cbccc9] px-6 py-5 text-center">
        <h2 className="font-heading text-[22px] leading-none text-[#1a1a1a] uppercase">
          {step === 1 ? 'Add User' : `Add ${selectedRole ? ROLE_META[selectedRole].label : 'User'}`}
        </h2>
        <p className="mt-1 text-[12px] text-[#999]">
          Step {step} of 2 — {step === 1 ? 'Choose Role' : 'Account Details'}
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="focus-visible:ring-primary absolute top-4 right-4 rounded p-1 text-[#666666] hover:bg-[#f0f0ee] focus-visible:ring-2 focus-visible:outline-none"
        >
          <X className="size-4" />
        </button>
      </div>

      {step === 1 ? (
        <div className="space-y-2 px-6 py-5">
          <p className="mb-3 text-[12px] text-[#666666]">Select the role for this user:</p>
          {(Object.entries(ROLE_META) as [EditableRole, (typeof ROLE_META)[EditableRole]][]).map(
            ([r, m]) => {
              const Icon = m.icon
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedRole(r)}
                  className={`flex w-full cursor-pointer items-center gap-4 rounded-lg border px-4 py-3 text-left transition-colors ${selectedRole === r ? `${m.header} border-current` : 'border-[#cbccc9] hover:border-[#1a1a1a]'}`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${m.badge}`}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-[13px] font-bold text-[#1a1a1a]">{m.label}</p>
                    <p className="text-[12px] text-[#666666]">{m.desc}</p>
                  </div>
                </button>
              )
            },
          )}
          <div className="border-t border-[#cbccc9] pt-3">
            <button
              disabled={!selectedRole}
              onClick={() => setStep(2)}
              className="w-full rounded bg-[#1a1a1a] py-2.5 text-[13px] font-bold text-white hover:bg-[#333] disabled:opacity-40"
            >
              Continue →
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleCreate}>
          <div className="space-y-3 px-6 py-5">
            <div className="space-y-1">
              <label className="block text-[11px] font-bold tracking-[1.5px] text-[#666666] uppercase">
                Full Name *
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Nguyễn Văn A"
                className="focus:ring-primary h-[38px] w-full rounded border border-[#cbccc9] px-3 text-[13px] focus:ring-2 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-bold tracking-[1.5px] text-[#666666] uppercase">
                Email *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="user@example.com"
                className="focus:ring-primary h-[38px] w-full rounded border border-[#cbccc9] px-3 text-[13px] focus:ring-2 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-bold tracking-[1.5px] text-[#666666] uppercase">
                Password *
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Min. 8 characters"
                className="focus:ring-primary h-[38px] w-full rounded border border-[#cbccc9] px-3 text-[13px] focus:ring-2 focus:outline-none"
              />
            </div>
            <div className="flex items-start gap-2 rounded bg-blue-50 p-3">
              <Info className="mt-0.5 size-3.5 shrink-0 text-blue-500" aria-hidden="true" />
              <p className="text-[11px] leading-[1.5] text-blue-700">
                After account creation, the user will complete their profile, upload KYC documents,
                and await admin approval during onboarding.
              </p>
            </div>
          </div>
          <div className="flex gap-3 border-t border-[#cbccc9] px-6 py-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 rounded border border-[#cbccc9] py-2 text-[13px] font-medium text-[#666666] hover:bg-[#f7f8fa]"
            >
              ← Back
            </button>
            <button
              type="submit"
              disabled={pending}
              className="flex-1 rounded bg-[#1a1a1a] py-2 text-[13px] font-bold text-white hover:bg-[#333] disabled:opacity-50"
            >
              {pending ? 'Creating…' : 'Create User'}
            </button>
          </div>
        </form>
      )}
    </>
  )
}

// ── Modal wrapper ──────────────────────────────────────────────────────────

export function UserModal({ user, kycPhotos, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-xl bg-white px-6 py-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {user ? (
          <EditModal user={user} kycPhotos={kycPhotos} onClose={onClose} />
        ) : (
          <CreateModal onClose={onClose} />
        )}
      </div>
    </div>
  )
}
