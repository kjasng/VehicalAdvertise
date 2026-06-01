'use client'

import { useState, useTransition } from 'react'

import { Pencil, ShieldCheck, ShieldOff, Trash2, X, Check } from 'lucide-react'
import { toast } from 'sonner'

import { EmptyState } from '@/components/shared/empty-state'
import type { AdminUserRow } from '@/lib/admin/queries-users'

import { changeUserRole, deleteUser, setUserBlocked } from './actions'

interface Props {
  users: AdminUserRow[]
}

const ROLE_STYLES: Record<string, string> = {
  admin: 'bg-primary/10 text-primary',
  driver: 'bg-blue-100 text-blue-700',
  partner: 'bg-purple-100 text-purple-700',
  garage: 'bg-orange-100 text-orange-700',
  pending: 'bg-[#f0f0ee] text-[#666666]',
}

const EDITABLE_ROLES = ['driver', 'partner', 'garage'] as const

// ── Tooltip icon button ────────────────────────────────────────────────────

function IconBtn({
  tooltip,
  onClick,
  disabled,
  variant = 'default',
  children,
}: {
  tooltip: string
  onClick: () => void
  disabled?: boolean
  variant?: 'default' | 'danger' | 'warning'
  children: React.ReactNode
}) {
  const colorMap = {
    default: 'text-[#666666] hover:bg-[#f0f0ee] hover:text-[#1a1a1a]',
    danger: 'text-red-500 hover:bg-red-50 hover:text-red-600',
    warning: 'text-yellow-600 hover:bg-yellow-50',
  }
  return (
    <div className="group/tip relative">
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        aria-label={tooltip}
        className={`focus-visible:ring-primary flex h-7 w-7 items-center justify-center rounded transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:opacity-40 ${colorMap[variant]}`}
      >
        {children}
      </button>
      {/* CSS-only tooltip */}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 -translate-x-1/2 rounded bg-[#1a1a1a] px-2 py-1 text-[11px] leading-none whitespace-nowrap text-white opacity-0 transition-opacity group-hover/tip:opacity-100"
      >
        {tooltip}
      </span>
    </div>
  )
}

// ── Main table ─────────────────────────────────────────────────────────────

export function UsersTableClient({ users }: Props) {
  const [pending, startTransition] = useTransition()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editRole, setEditRole] = useState<string>('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  function startEdit(user: AdminUserRow) {
    setEditingId(user.id)
    setEditRole(user.role)
    setDeletingId(null)
  }

  function handleSaveRole(user: AdminUserRow) {
    startTransition(async () => {
      const result = await changeUserRole({ targetId: user.id, role: editRole })
      if (result.error) toast.error(result.error)
      else {
        toast.success(`${user.fullName} role changed to ${editRole}`)
        setEditingId(null)
      }
    })
  }

  function handleToggleBlocked(user: AdminUserRow) {
    startTransition(async () => {
      const result = await setUserBlocked({ targetId: user.id, blocked: !user.blocked })
      if (result.error) toast.error(result.error)
      else toast.success(`${user.fullName} ${!user.blocked ? 'suspended' : 'unsuspended'}`)
    })
  }

  function handleDelete(user: AdminUserRow) {
    startTransition(async () => {
      const result = await deleteUser({ targetId: user.id })
      if (result.error) toast.error(result.error)
      else {
        toast.success(`${user.fullName} deleted`)
        setDeletingId(null)
      }
    })
  }

  if (users.length === 0)
    return <EmptyState kicker="empty" title="No Users" helper="No users match your search." />

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead className="bg-[#f7f8fa]">
          <tr>
            {['Name', 'Email', 'Role', 'Joined', 'Status', 'Actions'].map((h) => (
              <th
                key={h}
                className="border-b border-[#cbccc9] px-4 py-3 text-left text-[12px] font-extrabold tracking-[1.5px] text-[#1a1a1a] uppercase"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users.map((user, i) => (
            <tr
              key={user.id}
              className={`border-b border-[#cbccc9] last:border-0 ${i % 2 === 1 ? 'bg-[#f7f8fa]' : ''}`}
            >
              <td className="px-4 py-3 font-medium text-[#1a1a1a]">{user.fullName}</td>
              <td className="px-4 py-3 text-[#666666]">{user.email ?? '—'}</td>

              {/* Role — editable inline */}
              <td className="px-4 py-3">
                {editingId === user.id ? (
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="focus:ring-primary rounded border border-[#cbccc9] bg-white px-2 py-1 text-[12px] text-[#1a1a1a] focus:ring-2 focus:outline-none"
                    autoFocus
                  >
                    {EDITABLE_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span
                    className={`inline-block rounded px-2 py-0.5 text-[11px] font-bold tracking-[1px] uppercase ${ROLE_STYLES[user.role] ?? ''}`}
                  >
                    {user.role}
                  </span>
                )}
              </td>

              <td className="px-4 py-3 text-[#666666]">{user.joinedAt.slice(0, 10)}</td>

              {/* Status */}
              <td className="px-4 py-3">
                {user.blocked ? (
                  <span className="inline-block rounded bg-red-100 px-2 py-0.5 text-[11px] font-bold tracking-[1px] text-red-600 uppercase">
                    Suspended
                  </span>
                ) : (
                  <span className="inline-block rounded bg-green-100 px-2 py-0.5 text-[11px] font-bold tracking-[1px] text-green-700 uppercase">
                    Active
                  </span>
                )}
              </td>

              {/* Actions */}
              <td className="px-4 py-3">
                {editingId === user.id ? (
                  /* Save / Cancel when editing */
                  <div className="flex items-center gap-1">
                    <IconBtn
                      tooltip="Save"
                      onClick={() => handleSaveRole(user)}
                      disabled={pending}
                      variant="default"
                    >
                      <Check className="size-3.5" />
                    </IconBtn>
                    <IconBtn tooltip="Cancel" onClick={() => setEditingId(null)} variant="default">
                      <X className="size-3.5" />
                    </IconBtn>
                  </div>
                ) : deletingId === user.id ? (
                  /* Confirm delete */
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-red-600">Delete?</span>
                    <IconBtn
                      tooltip="Confirm delete"
                      onClick={() => handleDelete(user)}
                      disabled={pending}
                      variant="danger"
                    >
                      <Check className="size-3.5" />
                    </IconBtn>
                    <IconBtn tooltip="Cancel" onClick={() => setDeletingId(null)} variant="default">
                      <X className="size-3.5" />
                    </IconBtn>
                  </div>
                ) : (
                  /* Normal: 3 icon buttons */
                  <div className="flex items-center gap-0.5">
                    {user.role !== 'admin' && (
                      <IconBtn
                        tooltip="Edit role"
                        onClick={() => startEdit(user)}
                        disabled={pending}
                      >
                        <Pencil className="size-3.5" />
                      </IconBtn>
                    )}
                    <IconBtn
                      tooltip={user.blocked ? 'Unsuspend' : 'Suspend'}
                      onClick={() => handleToggleBlocked(user)}
                      disabled={pending}
                      variant={user.blocked ? 'default' : 'warning'}
                    >
                      {user.blocked ? (
                        <ShieldCheck className="size-3.5" />
                      ) : (
                        <ShieldOff className="size-3.5" />
                      )}
                    </IconBtn>
                    {user.role !== 'admin' && (
                      <IconBtn
                        tooltip="Delete user"
                        onClick={() => {
                          setDeletingId(user.id)
                          setEditingId(null)
                        }}
                        disabled={pending}
                        variant="danger"
                      >
                        <Trash2 className="size-3.5" />
                      </IconBtn>
                    )}
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
