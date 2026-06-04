import { redirect } from 'next/navigation'

import { EmptyState } from '@/components/shared/empty-state'
import { PageHeader } from '@/components/shared/page-header'
import { getGarageProfile } from '@/lib/garage/queries-context'
import { getGarageInstallJobs } from '@/lib/garage/queries-installs'

import { GarageInstallsClient } from './garage-installs-client'

export const metadata = { title: 'Garage · Installs' }

export default async function GarageInstallsPage() {
  const [profile, jobs] = await Promise.all([getGarageProfile(), getGarageInstallJobs()])
  if (!profile) redirect('/login')

  if (!profile.approved) {
    return (
      <div className="space-y-6">
        <PageHeader kicker="WORKQUEUE" title="INSTALL ORDERS" />
        <EmptyState
          kicker="pending"
          title="Waiting Approval"
          helper="Garage của bạn đang chờ admin duyệt. Sau khi approved, install jobs sẽ hiển thị ở đây."
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader kicker="WORKQUEUE" title="INSTALL ORDERS" />
      <GarageInstallsClient jobs={jobs} />
    </div>
  )
}
