/**
 * Users — filterable user directory with bulk actions and create/edit modal.
 * Server component: reads ?q= ?role= ?status= URL params for server-side filtering.
 * All interactive features handled by UsersTableClient.
 */
import { Search } from 'lucide-react'

import { PageHeader } from '@/components/shared/page-header'
import { SectionShell } from '@/components/shared/section-shell'
import { getUsers } from '@/lib/admin/queries-users'

import { UsersTableClient } from './users-table-client'

export const metadata = { title: 'Admin · Users' }

const ROLES = ['driver', 'partner', 'garage', 'admin', 'pending']

interface UsersPageProps {
  searchParams: Promise<{ q?: string; role?: string; status?: string }>
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const { q, role, status } = await searchParams
  const users = await getUsers({ search: q, role: role || '', status: status || '' })

  const activeRole = role || ''
  const activeStatus = status || ''
  const hasFilter = !!(q || activeRole || activeStatus)

  return (
    <div className="space-y-6">
      <PageHeader kicker="System" title="Users" />
      <SectionShell>
        {/* Filter bar */}
        <form method="get" action="/admin/users" className="mb-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="focus-within:ring-primary flex flex-1 items-center gap-2 rounded-lg border border-[#cbccc9] bg-white px-3 py-2 focus-within:ring-2">
              <Search className="size-4 shrink-0 text-[#999]" aria-hidden="true" />
              <input
                type="search"
                name="q"
                defaultValue={q ?? ''}
                placeholder="Search by name or email…"
                className="flex-1 bg-transparent text-[13px] text-[#1a1a1a] placeholder:text-[#bbb] focus:outline-none"
                aria-label="Search users"
              />
            </div>
            <button
              type="submit"
              className="h-[40px] shrink-0 rounded-lg bg-[#1a1a1a] px-5 text-[12px] font-bold tracking-[0.5px] text-white hover:bg-[#333]"
            >
              Search
            </button>
            {hasFilter && (
              <a
                href="/admin/users"
                className="flex h-[40px] shrink-0 items-center rounded-lg border border-[#cbccc9] px-4 text-[12px] font-medium text-[#666666] hover:border-[#1a1a1a] hover:text-[#1a1a1a]"
              >
                Clear all
              </a>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1">
              <span className="mr-1 text-[11px] font-bold tracking-[1.5px] text-[#999] uppercase">
                Role
              </span>
              {['', ...ROLES].map((r) => (
                <button
                  key={r || 'all'}
                  type="submit"
                  name="role"
                  value={r}
                  className={`rounded-full px-3 py-1 text-[11px] font-bold tracking-[0.5px] transition-colors ${activeRole === r ? 'bg-[#1a1a1a] text-white' : 'text-[#666666] hover:bg-[#f0f0ee] hover:text-[#1a1a1a]'}`}
                >
                  {r === '' ? 'All' : r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
            <div className="h-4 w-px bg-[#e0e0de]" aria-hidden="true" />
            <div className="flex items-center gap-1">
              <span className="mr-1 text-[11px] font-bold tracking-[1.5px] text-[#999] uppercase">
                Status
              </span>
              {[
                { value: '', label: 'All' },
                { value: 'active', label: 'Active' },
                { value: 'suspended', label: 'Suspended' },
              ].map(({ value, label }) => (
                <button
                  key={value || 'all'}
                  type="submit"
                  name="status"
                  value={value}
                  className={`rounded-full px-3 py-1 text-[11px] font-bold tracking-[0.5px] transition-colors ${
                    activeStatus === value
                      ? value === 'suspended'
                        ? 'bg-red-600 text-white'
                        : value === 'active'
                          ? 'bg-green-600 text-white'
                          : 'bg-[#1a1a1a] text-white'
                      : 'text-[#666666] hover:bg-[#f0f0ee] hover:text-[#1a1a1a]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          {q && <input type="hidden" name="q" value={q} />}
        </form>

        <UsersTableClient users={users} />
      </SectionShell>
    </div>
  )
}
