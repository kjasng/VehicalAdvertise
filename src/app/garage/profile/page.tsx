import { redirect } from 'next/navigation'

import { GaragePayoutSettingsForm } from '@/components/garage/garage-payout-settings-form'
import { PageHeader } from '@/components/shared/page-header'
import { getGarageProfile } from '@/lib/garage/queries-context'

export const metadata = { title: 'Garage · Profile' }

export default async function GarageProfilePage() {
  const profile = await getGarageProfile()
  if (!profile) redirect('/login')

  return (
    <div className="space-y-6">
      <PageHeader kicker="ACCOUNT" title="Profile" />
      <GaragePayoutSettingsForm profile={profile} />
    </div>
  )
}
