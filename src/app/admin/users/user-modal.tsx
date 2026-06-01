'use client'

/**
 * UserModal — create or edit a user.
 * Mode is determined by whether `user` prop is provided.
 */
import { useState, useTransition } from 'react'

import { X } from 'lucide-react'
import { toast } from 'sonner'

import type { AdminUserRow } from '@/lib/admin/queries-users'

import { createUser, updateUser } from './actions'

const ROLES = ['driver', 'partner', 'garage'] as const

interface Props {
  user?: AdminUserRow | null // null = create mode
  onClose: () => void
}

export function UserModal({ user, onClose }: Props) {
  const isEdit = !!user
  const [pending, startTransition] = useTransition()
  // State initialised from props — parent must pass key={user?.id ?? 'create'}
  // so React re-mounts when switching between users.
  const [fullName, setFullName] = useState(user?.fullName ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [role, setRole] = useState<string>(isEdit && user?.role !== 'admin' ? user!.role : 'driver')
  const [password, setPassword] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const result = isEdit
        ? await updateUser({ targetId: user!.id, fullName, role })
        : await createUser({ email, fullName, role, password })
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(isEdit ? `${fullName} updated` : `${fullName} created`)
        onClose()
      }
    })
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      {/* Modal panel */}
      <div
        className="w-full max-w-md rounded-lg bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#cbccc9] px-6 py-4">
          <h2
            id="user-modal-title"
            className="font-heading text-[20px] leading-none text-[#1a1a1a] uppercase"
          >
            {isEdit ? 'Edit User' : 'Add User'}
          </h2>
          <button
            onClick={onClose}
            className="focus-visible:ring-primary rounded p-1 text-[#666666] transition-colors hover:bg-[#f0f0ee] hover:text-[#1a1a1a] focus-visible:ring-2 focus-visible:outline-none"
            aria-label="Close modal"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold tracking-[2px] text-[#666666] uppercase">
              Full name *
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="Nguyễn Văn A"
              className="focus:ring-primary h-[40px] w-full rounded border border-[#cbccc9] px-3 text-[13px] text-[#1a1a1a] placeholder:text-[#999] focus:ring-2 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold tracking-[2px] text-[#666666] uppercase">
              Email *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isEdit}
              placeholder="user@example.com"
              className="focus:ring-primary h-[40px] w-full rounded border border-[#cbccc9] px-3 text-[13px] text-[#1a1a1a] placeholder:text-[#999] focus:ring-2 focus:outline-none disabled:bg-[#f7f8fa] disabled:text-[#999]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold tracking-[2px] text-[#666666] uppercase">
              Role *
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="focus:ring-primary h-[40px] w-full rounded border border-[#cbccc9] bg-white px-3 text-[13px] text-[#1a1a1a] focus:ring-2 focus:outline-none"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {!isEdit && (
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold tracking-[2px] text-[#666666] uppercase">
                Password *
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Min. 8 characters"
                className="focus:ring-primary h-[40px] w-full rounded border border-[#cbccc9] px-3 text-[13px] text-[#1a1a1a] placeholder:text-[#999] focus:ring-2 focus:outline-none"
              />
            </div>
          )}

          <div className="flex gap-3 border-t border-[#cbccc9] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded border border-[#cbccc9] py-2 text-[13px] font-medium text-[#666666] transition-colors hover:bg-[#f7f8fa]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="flex-1 rounded bg-[#1a1a1a] py-2 text-[13px] font-bold text-white transition-colors hover:bg-[#333] disabled:opacity-50"
            >
              {pending ? 'Saving…' : isEdit ? 'Save Changes' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
