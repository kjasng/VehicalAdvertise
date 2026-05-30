/**
 * Users — searchable user directory with suspend toggle.
 * Server component: reads ?q= URL param, fetches real profiles.
 * Suspend toggle handled by UsersTableClient.
 */
import { Search } from 'lucide-react'

import { PageHeader } from '@/components/shared/page-header'
import { SectionShell } from '@/components/shared/section-shell'
import { getUsers } from '@/lib/admin/queries-users'

import { UsersTableClient } from './users-table-client'

export const metadata = { title: 'Admin · Users' }

interface UsersPageProps {
  searchParams: Promise<{ q?: string }>
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const { q } = await searchParams
  const users = await getUsers(q)

  return (
    <div className="space-y-6">
      <PageHeader kicker="System" title="Users" />
      <SectionShell title={`All Users (${users.length})`}>
        {/* Server-rendered GET form — no client state needed for search */}
        <form method="get" action="/admin/users" className="mb-4">
          <div className="focus-within:ring-primary flex items-center gap-2 rounded border border-[#cbccc9] px-3 py-2 focus-within:ring-2">
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
        </form>
        <UsersTableClient users={users} />
      </SectionShell>
    </div>
  )
}
