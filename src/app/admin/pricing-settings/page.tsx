/**
 * Settings — admin-managed money parameters.
 */
import { PageHeader } from '@/components/shared/page-header'
import { getPricingSettings } from '@/lib/admin/queries-pricing-settings'

import { PricingSettingsClient } from './pricing-settings-client'

export const metadata = { title: 'Admin · Settings' }

export default async function PricingSettingsPage() {
  const settings = await getPricingSettings()

  return (
    <div className="space-y-6">
      <PageHeader kicker="Money" title="Settings" />
      <PricingSettingsClient settings={settings} />
    </div>
  )
}
