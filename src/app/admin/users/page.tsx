'use client'

/**
 * Users — searchable user table with role badges + suspend toggle.
 * Client component for search filtering + suspend stub action.
 */
import { useState } from 'react'

import { Search, ShieldOff, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'

import type { UserRow } from '@/components/admin/mock-data'
import { MOCK_USERS } from '@/components/admin/mock-data'
import { PageHeader } from '@/components/shared/page-header'
import { SectionShell } from '@/components/shared/section-shell'

const ROLE_STYLES: Record<string, string> = {
  admin: 'bg-primary/10 text-primary',
  driver: 'bg-blue-100 text-blue-700',
  partner: 'bg-purple-100 text-purple-700',
  garage: 'bg-orange-100 text-orange-700',
}

export default function UsersPage() {
  const [search, setSearch] = useState('')
  const [users, setUsers] = useState<UserRow[]>(MOCK_USERS)

  const filtered = users.filter((u) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    )
  })

  function toggleSuspend(id: string) {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== id) return u
        const next = { ...u, suspended: !u.suspended }
        console.log('[STUB] suspend toggle', id, next.suspended)
        toast.success(`${next.name} ${next.suspended ? 'suspended' : 'unsuspended'}`)
        return next
      }),
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader kicker="System" title="Users" />

      <SectionShell title={`All Users (${filtered.length})`}>
        {/* Search */}
        <div className="focus-within:ring-primary mb-4 flex items-center gap-2 rounded border border-[#cbccc9] px-3 py-2 focus-within:ring-2">
          <Search className="size-4 shrink-0 text-[#666666]" aria-hidden="true" />
          <input
            type="search"
            placeholder="Search by name, email, role…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-[13px] text-[#1a1a1a] placeholder:text-[#999] focus:outline-none"
            aria-label="Search users"
          />
        </div>

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
              {filtered.map((user, i) => (
                <tr
                  key={user.id}
                  className={`border-b border-[#cbccc9] last:border-0 ${i % 2 === 1 ? 'bg-[#f7f8fa]' : ''}`}
                >
                  <td className="px-4 py-3 font-medium text-[#1a1a1a]">{user.name}</td>
                  <td className="px-4 py-3 text-[#666666]">{user.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-[11px] font-bold tracking-[1px] uppercase ${ROLE_STYLES[user.role] ?? ''}`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#666666]">{user.joinedAt}</td>
                  <td className="px-4 py-3">
                    {user.suspended ? (
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
                      onClick={() => toggleSuspend(user.id)}
                      className="focus-visible:ring-primary flex items-center gap-1.5 rounded border border-[#cbccc9] px-3 py-1.5 text-[12px] font-medium text-[#1a1a1a] transition-colors hover:bg-[#f7f8fa] focus-visible:ring-2 focus-visible:outline-none"
                      aria-label={`${user.suspended ? 'Unsuspend' : 'Suspend'} ${user.name}`}
                    >
                      {user.suspended ? (
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
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-[13px] text-[#666666]">
                    No users match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </SectionShell>
    </div>
  )
}
