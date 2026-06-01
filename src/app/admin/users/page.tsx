/**
 * Users — fetch all users, pass to UsersTableClient.
 * All filtering (search, role, status) is handled client-side with no reload.
 */
import { PageHeader } from '@/components/shared/page-header'
import { SectionShell } from '@/components/shared/section-shell'
import { getUsers } from '@/lib/admin/queries-users'

import { UsersTableClient } from './users-table-client'

export const metadata = { title: 'Admin · Users' }

export default async function UsersPage() {
  const users = await getUsers()

  return (
    <div className="space-y-6">
      <PageHeader kicker="System" title="Users" />
      <SectionShell>
        <UsersTableClient users={users} />
      </SectionShell>
    </div>
  )
}
