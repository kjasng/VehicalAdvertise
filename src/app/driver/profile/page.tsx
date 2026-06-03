import { redirect } from 'next/navigation'

import { DriverProfileForm } from '@/components/driver/driver-profile-form'
import { PageHeader } from '@/components/shared/page-header'
import { getDriverProfileData } from '@/lib/driver/queries-profile'

export const metadata = { title: 'Driver · Profile' }

export default async function DriverProfilePage() {
  const profile = await getDriverProfileData()
  if (!profile) redirect('/login')

  return (
    <div className="space-y-6">
      <PageHeader kicker="ACCOUNT" title="Profile" />
      <DriverProfileForm profile={profile} />
    </div>
  )
}
