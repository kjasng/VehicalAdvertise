'use client'

import { useMemo, useState, useTransition } from 'react'

import { Pencil, Plus, RefreshCw, Search, ShieldCheck, ShieldOff, Trash2, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { EmptyState } from '@/components/shared/empty-state'
import type { AdminUserRow } from '@/lib/admin/queries-users'

import {
  bulkChangeRole,
  bulkDeleteUsers,
  bulkSetUsersBlocked,
  deleteUser,
  fetchUserKycPhotos,
  setUserBlocked,
} from './actions'
import { ConfirmModal } from './confirm-modal'
import { UserModal } from './user-modal'

type KycPhotos = { front: string | null; back: string | null; selfie: string | null }

type ConfirmAction =
  | { type: 'delete'; user: AdminUserRow }
  | { type: 'suspend'; user: AdminUserRow }
  | { type: 'unsuspend'; user: AdminUserRow }
  | { type: 'bulk-delete' }
  | { type: 'bulk-suspend'; blocked: boolean }

interface Props {
  users: AdminUserRow[]
  currentUserId: string | null
}

const ROLE_STYLES: Record<string, string> = {
  admin: 'bg-primary/10 text-primary',
  driver: 'bg-blue-100 text-blue-700',
  partner: 'bg-purple-100 text-purple-700',
  garage: 'bg-orange-100 text-orange-700',
  pending: 'bg-[#f0f0ee] text-[#666666]',
}

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
  // Explicit class strings so Tailwind JIT always includes them
  const variantCls =
    variant === 'danger'
      ? 'text-red-500 hover:bg-red-50 hover:text-red-600'
      : variant === 'warning'
        ? 'text-yellow-600 hover:bg-yellow-50'
        : 'text-[#666666] hover:bg-[#f0f0ee] hover:text-[#1a1a1a]'

  return (
    // Unnamed group — avoids Tailwind v4 named-group parsing issues
    <div className="group relative">
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        aria-label={tooltip}
        className={`focus-visible:ring-primary flex h-8 w-8 cursor-pointer items-center justify-center rounded transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:opacity-40 ${variantCls}`}
      >
        {children}
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-1.5 -translate-x-1/2 rounded bg-[#1a1a1a] px-2 py-1 text-[11px] leading-none whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100"
      >
        {tooltip}
      </span>
    </div>
  )
}

const ROLES = ['driver', 'partner', 'garage', 'admin', 'pending']

export function UsersTableClient({ users, currentUserId }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [refreshing, startRefreshTransition] = useTransition()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkRole, setBulkRole] = useState('driver')
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null)
  // undefined = closed, null = create mode, AdminUserRow = edit mode
  const [modalUser, setModalUser] = useState<AdminUserRow | null | undefined>(undefined)
  const [kycPhotos, setKycPhotos] = useState<KycPhotos | null>(null)

  // Client-side filter state — no page reload needed
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return users.filter((u) => {
      if (q && !u.fullName.toLowerCase().includes(q) && !u.email?.toLowerCase().includes(q))
        return false
      if (roleFilter && u.role !== roleFilter) return false
      if (statusFilter === 'active' && u.blocked) return false
      if (statusFilter === 'suspended' && !u.blocked) return false
      return true
    })
  }, [users, search, roleFilter, statusFilter])

  function handleRefresh() {
    setSelected(new Set())
    startRefreshTransition(() => {
      router.refresh()
    })
  }

  async function openEdit(user: AdminUserRow) {
    setModalUser(user)
    setKycPhotos(null)
    if (user.role === 'driver') {
      const photos = await fetchUserKycPhotos(user.id)
      setKycPhotos(photos)
    }
  }

  const allIds = filtered.filter((u) => u.role !== 'admin').map((u) => u.id)
  const allChecked = allIds.length > 0 && allIds.every((id) => selected.has(id))
  const toggle = (id: string) =>
    setSelected((prev) => {
      const s = new Set(prev)
      if (s.has(id)) s.delete(id)
      else s.add(id)
      return s
    })
  const toggleAll = () => setSelected(allChecked ? new Set() : new Set(allIds))

  // Execute the confirmed action
  function executeConfirm() {
    if (!confirmAction) return
    startTransition(async () => {
      let error: string | null = null

      if (confirmAction.type === 'delete') {
        const r = await deleteUser({ targetId: confirmAction.user.id })
        error = r.error
        if (!error) toast.success(`${confirmAction.user.fullName} deleted`)
      } else if (confirmAction.type === 'suspend' || confirmAction.type === 'unsuspend') {
        const blocked = confirmAction.type === 'suspend'
        const r = await setUserBlocked({ targetId: confirmAction.user.id, blocked })
        error = r.error
        if (!error)
          toast.success(`${confirmAction.user.fullName} ${blocked ? 'suspended' : 'unsuspended'}`)
      } else if (confirmAction.type === 'bulk-delete') {
        const r = await bulkDeleteUsers({ ids: [...selected] })
        error = r.error
        if (!error) {
          toast.success(`${r.count} user(s) deleted`)
          setSelected(new Set())
        }
      } else if (confirmAction.type === 'bulk-suspend') {
        const r = await bulkSetUsersBlocked({ ids: [...selected], blocked: confirmAction.blocked })
        error = r.error
        if (!error) {
          toast.success(`${r.count} user(s) ${confirmAction.blocked ? 'suspended' : 'unsuspended'}`)
          setSelected(new Set())
        }
      }

      if (error) toast.error(error)
      else setConfirmAction(null)
    })
  }

  function handleBulkRole() {
    startTransition(async () => {
      const r = await bulkChangeRole({
        ids: [...selected],
        role: bulkRole as 'driver' | 'partner' | 'garage',
      })
      if (r.error) toast.error(r.error)
      else {
        toast.success(`${r.count} user(s) role changed to ${bulkRole}`)
        setSelected(new Set())
      }
    })
  }

  return (
    <>
      {/* ── Toolbar: search + dropdown filters + add button ── */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="focus-within:ring-primary flex min-w-[160px] flex-1 items-center gap-2 rounded border border-[#cbccc9] bg-white px-3 py-[7px] focus-within:ring-2">
          <Search className="size-3.5 shrink-0 text-[#bbb]" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="flex-1 bg-transparent text-[13px] text-[#1a1a1a] placeholder:text-[#bbb] focus:outline-none"
          />
        </div>

        {/* Status dropdown */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="focus:ring-primary h-[34px] cursor-pointer appearance-none rounded border border-[#cbccc9] bg-white bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23666%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[right_8px_center] bg-no-repeat px-3 pr-8 text-[13px] text-[#1a1a1a] focus:ring-2 focus:outline-none"
          aria-label="Filter by status"
        >
          <option value="">Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>

        {/* Role dropdown */}
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="focus:ring-primary h-[34px] cursor-pointer appearance-none rounded border border-[#cbccc9] bg-white bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23666%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[right_8px_center] bg-no-repeat px-3 pr-8 text-[13px] text-[#1a1a1a] focus:ring-2 focus:outline-none"
          aria-label="Filter by role"
        >
          <option value="">All</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </option>
          ))}
        </select>

        {(search || roleFilter || statusFilter) && (
          <button
            type="button"
            onClick={() => {
              setSearch('')
              setRoleFilter('')
              setStatusFilter('')
            }}
            className="flex h-[34px] cursor-pointer items-center gap-1 rounded border bg-red-400 px-3 text-[12px] text-white"
          >
            Clear <X size={16} />
          </button>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        <IconBtn tooltip="Refresh users" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw
            className={`size-3.5 ${refreshing ? 'animate-spin' : ''}`}
            aria-hidden="true"
          />
        </IconBtn>

        {/* Add User button */}
        <button
          onClick={() => setModalUser(null)}
          className="focus-visible:ring-primary flex shrink-0 cursor-pointer items-center gap-1.5 rounded bg-[#1a1a1a] px-4 py-[7px] text-[13px] font-bold text-white hover:bg-[#333] focus-visible:ring-2 focus-visible:outline-none"
        >
          <Plus className="size-3.5" aria-hidden="true" /> New User
        </button>
      </div>

      {/* Row count */}
      <div className="mb-3">
        <p className="text-[11px] font-bold tracking-[2.5px] text-[#666666] uppercase">
          {filtered.length === users.length
            ? `All Users (${users.length})`
            : `${filtered.length} of ${users.length} users`}
        </p>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-3 rounded border border-[#cbccc9] bg-[#f7f8fa] px-4 py-2.5">
          <span className="text-[12px] font-bold text-[#1a1a1a]">{selected.size} selected</span>
          <button
            onClick={() => setSelected(new Set())}
            className="text-[12px] text-[#666666] underline hover:text-[#1a1a1a]"
          >
            Clear
          </button>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            {/* Role change */}
            <div className="flex items-center gap-1">
              <select
                value={bulkRole}
                onChange={(e) => setBulkRole(e.target.value)}
                className="focus:ring-primary h-7 rounded border border-[#cbccc9] bg-white px-2 text-[12px] focus:ring-2 focus:outline-none"
              >
                {['driver', 'partner', 'garage'].map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <button
                disabled={pending}
                onClick={handleBulkRole}
                className="h-7 rounded border border-[#cbccc9] px-2 text-[12px] font-medium text-[#1a1a1a] hover:bg-white disabled:opacity-50"
              >
                Set role
              </button>
            </div>
            <button
              disabled={pending}
              onClick={() => setConfirmAction({ type: 'bulk-suspend', blocked: true })}
              className="flex h-7 items-center gap-1 rounded border border-[#cbccc9] px-2 text-[12px] font-medium text-yellow-700 hover:bg-yellow-50 disabled:opacity-50"
            >
              <ShieldOff className="size-3" /> Suspend
            </button>
            <button
              disabled={pending}
              onClick={() => setConfirmAction({ type: 'bulk-suspend', blocked: false })}
              className="flex h-7 items-center gap-1 rounded border border-[#cbccc9] px-2 text-[12px] font-medium text-green-700 hover:bg-green-50 disabled:opacity-50"
            >
              <ShieldCheck className="size-3" /> Unsuspend
            </button>
            <button
              disabled={pending}
              onClick={() => setConfirmAction({ type: 'bulk-delete' })}
              className="flex h-7 items-center gap-1 rounded border border-red-200 px-2 text-[12px] font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              <Trash2 className="size-3" /> Delete
            </button>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState kicker="empty" title="No Users" helper="No users match your filters." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="bg-[#f7f8fa]">
              <tr>
                <th className="border-b border-[#cbccc9] px-3 py-3">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    onChange={toggleAll}
                    className="accent-primary size-3.5"
                    aria-label="Select all"
                  />
                </th>
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
              {filtered.map((user, i) => {
                const isSelf = user.id === currentUserId
                return (
                  <tr
                    key={user.id}
                    className={`border-b border-[#cbccc9] last:border-0 ${i % 2 === 1 ? 'bg-[#f7f8fa]' : ''} ${selected.has(user.id) ? 'bg-primary/5' : ''}`}
                  >
                    <td className="px-3 py-3">
                      {user.role !== 'admin' && (
                        <input
                          type="checkbox"
                          checked={selected.has(user.id)}
                          onChange={() => toggle(user.id)}
                          className="accent-primary size-3.5"
                          aria-label={`Select ${user.fullName}`}
                        />
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-[#1a1a1a]">{user.fullName}</td>
                    <td className="px-4 py-3 text-[#666666]">{user.email ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-[11px] font-bold tracking-[1px] uppercase ${ROLE_STYLES[user.role] ?? ''}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#666666]">{user.joinedAt.slice(0, 10)}</td>
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
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-0.5">
                        <IconBtn tooltip="Edit" onClick={() => openEdit(user)} disabled={pending}>
                          <Pencil className="size-3.5" />
                        </IconBtn>
                        <IconBtn
                          tooltip={user.blocked ? 'Unsuspend' : 'Suspend'}
                          onClick={() =>
                            setConfirmAction({
                              type: user.blocked ? 'unsuspend' : 'suspend',
                              user,
                            })
                          }
                          disabled={pending}
                          variant={user.blocked ? 'default' : 'warning'}
                        >
                          {user.blocked ? (
                            <ShieldCheck className="size-3.5" />
                          ) : (
                            <ShieldOff className="size-3.5" />
                          )}
                        </IconBtn>
                        <IconBtn
                          tooltip={isSelf ? 'Cannot delete yourself' : 'Delete'}
                          onClick={() => setConfirmAction({ type: 'delete', user })}
                          disabled={pending || isSelf}
                          variant="danger"
                        >
                          <Trash2 className="size-3.5" />
                        </IconBtn>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirm modal for delete / suspend actions */}
      {confirmAction && (
        <ConfirmModal
          title={
            confirmAction.type === 'delete'
              ? `Delete ${confirmAction.user.fullName}?`
              : confirmAction.type === 'suspend'
                ? `Suspend ${confirmAction.user.fullName}?`
                : confirmAction.type === 'unsuspend'
                  ? `Unsuspend ${confirmAction.user.fullName}?`
                  : confirmAction.type === 'bulk-delete'
                    ? `Delete ${selected.size} user(s)?`
                    : `${confirmAction.blocked ? 'Suspend' : 'Unsuspend'} ${selected.size} user(s)?`
          }
          message={
            confirmAction.type === 'delete'
              ? `This will permanently delete the account and all associated data. This action cannot be undone.`
              : confirmAction.type === 'suspend'
                ? `${confirmAction.user.fullName} will lose access to the platform immediately.`
                : confirmAction.type === 'unsuspend'
                  ? `${confirmAction.user.fullName} will regain access to the platform.`
                  : confirmAction.type === 'bulk-delete'
                    ? `This will permanently delete ${selected.size} accounts. This action cannot be undone.`
                    : `${selected.size} users will ${confirmAction.blocked ? 'lose' : 'regain'} access to the platform.`
          }
          confirmLabel={
            confirmAction.type === 'delete' || confirmAction.type === 'bulk-delete'
              ? 'Delete'
              : confirmAction.type === 'suspend' ||
                  (confirmAction.type === 'bulk-suspend' && confirmAction.blocked)
                ? 'Suspend'
                : 'Unsuspend'
          }
          variant={
            confirmAction.type === 'delete' || confirmAction.type === 'bulk-delete'
              ? 'danger'
              : 'warning'
          }
          pending={pending}
          onConfirm={executeConfirm}
          onClose={() => setConfirmAction(null)}
        />
      )}

      {/* Create / Edit modal — key forces re-mount when switching users */}
      {modalUser !== undefined && (
        <UserModal
          key={modalUser?.id ?? 'create'}
          user={modalUser}
          kycPhotos={kycPhotos}
          onClose={() => {
            setModalUser(undefined)
            setKycPhotos(null)
          }}
        />
      )}
    </>
  )
}
