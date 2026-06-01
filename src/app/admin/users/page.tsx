/**
 * Users — searchable, filterable user directory.
 * Server component: reads ?q= ?role= ?status= URL params, fetches profiles.
 * Bulk actions, create/edit modal handled by UsersTableClient.
 */
import { Search } from 'lucide-react'

import { PageHeader } from '@/components/shared/page-header'
import { SectionShell } from '@/components/shared/section-shell'
import { getUsers } from '@/lib/admin/queries-users'

import { UsersTableClient } from './users-table-client'

export const metadata = { title: 'Admin · Users' }

const ALL_ROLES = ['driver', 'partner', 'garage', 'admin', 'pending']

interface UsersPageProps {
  searchParams: Promise<{ q?: string; role?: string; status?: string }>
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const { q, role, status } = await searchParams
  const users = await getUsers({ search: q, role: role || '', status: status || '' })

  const hasFilter = !!(q || role || status)

  return (
    <div className="space-y-6">
      <PageHeader kicker="System" title="Users" />
      <SectionShell>
        {/* Filter bar — server GET form, no JS needed */}
        <form method="get" action="/admin/users" className="mb-5 flex flex-wrap items-end gap-3">
          {/* Search */}
          <div className="focus-within:ring-primary flex min-w-[200px] flex-1 items-center gap-2 rounded border border-[#cbccc9] px-3 py-2 focus-within:ring-2">
            <Search className="size-4 shrink-0 text-[#666666]" aria-hidden="true" />
            <input
              type="search"
              name="q"
              defaultValue={q ?? ''}
              placeholder="Search by name or email…"
              className="flex-1 bg-transparent text-[13px] text-[#1a1a1a] placeholder:text-[#999] focus:outline-none"
              aria-label="Search users"
            />
          </div>

          {/* Role filter */}
          <select
            name="role"
            defaultValue={role ?? ''}
            className="focus:ring-primary h-[38px] rounded border border-[#cbccc9] bg-white px-3 text-[13px] text-[#1a1a1a] focus:ring-2 focus:outline-none"
            aria-label="Filter by role"
          >
            <option value="">All roles</option>
            {ALL_ROLES.map((r) => (
              <option key={r} value={r}>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <select
            name="status"
            defaultValue={status ?? ''}
            className="focus:ring-primary h-[38px] rounded border border-[#cbccc9] bg-white px-3 text-[13px] text-[#1a1a1a] focus:ring-2 focus:outline-none"
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>

          <button
            type="submit"
            className="h-[38px] rounded border border-[#1a1a1a] bg-[#1a1a1a] px-4 text-[12px] font-bold text-white transition-colors hover:bg-[#333]"
          >
            Filter
          </button>

          {hasFilter && (
            <a
              href="/admin/users"
              className="flex h-[38px] items-center rounded border border-[#cbccc9] px-4 text-[12px] font-medium text-[#666666] transition-colors hover:border-[#1a1a1a] hover:text-[#1a1a1a]"
            >
              Clear
            </a>
          )}
        </form>

        {/* Table with bulk actions + create modal */}
        <UsersTableClient users={users} />
      </SectionShell>
    </div>
  )
}
