/**
 * Partner Balances — view all partner balances and manually top-up.
 * Admin uses this to credit a partner's wallet after offline bank transfer.
 */
import { PageHeader } from '@/components/shared/page-header'
import { getPartnerBalances } from '@/lib/admin/queries-partner-balances'

import { PartnerBalancesClient } from './partner-balances-client'

export const metadata = { title: 'Admin · Partner Balances' }

export default async function PartnerBalancesPage() {
  const rows = await getPartnerBalances()

  return (
    <div className="space-y-6">
      <PageHeader kicker="Money" title="Partner Balances" />
      <PartnerBalancesClient rows={rows} />
    </div>
  )
}
