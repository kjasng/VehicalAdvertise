'use client'

import { useTransition } from 'react'

import { ShieldCheck, ShieldOff } from 'lucide-react'
import { toast } from 'sonner'

import { EmptyState } from '@/components/shared/empty-state'
import type { AdminUserRow } from '@/lib/admin/queries-users'

import { setUserBlocked } from './actions'

interface UsersTableClientProps {
  users: AdminUserRow[]
}

const ROLE_STYLES: Record<string, string> = {
  admin: 'bg-primary/10 text-primary',
  driver: 'bg-blue-100 text-blue-700',
  partner: 'bg-purple-100 text-purple-700',
  garage: 'bg-orange-100 text-orange-700',
  pending: 'bg-[#f0f0ee] text-[#666666]',
}

export function UsersTableClient({ users }: UsersTableClientProps) {
  const [pending, startTransition] = useTransition()

  function toggleBlocked(user: AdminUserRow) {
    startTransition(async () => {
      const result = await setUserBlocked({ targetId: user.id, blocked: !user.blocked })
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`${user.fullName} ${!user.blocked ? 'suspended' : 'unsuspended'}`)
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
                <button
                  disabled={pending}
                  onClick={() => toggleBlocked(user)}
                  className="focus-visible:ring-primary flex items-center gap-1.5 rounded border border-[#cbccc9] px-3 py-1.5 text-[12px] font-medium text-[#1a1a1a] transition-colors hover:bg-[#f7f8fa] focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50"
                  aria-label={`${user.blocked ? 'Unsuspend' : 'Suspend'} ${user.fullName}`}
                >
                  {user.blocked ? (
                    <>
                      <ShieldCheck className="size-3.5" aria-hidden="true" /> Unsuspend
                    </>
                  ) : (
                    <>
                      <ShieldOff className="size-3.5" aria-hidden="true" /> Suspend
                    </>
                  )}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
