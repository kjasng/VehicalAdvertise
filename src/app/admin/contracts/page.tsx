/**
 * Campaigns — admin matches approved drivers to partner campaigns.
 * Also registers vehicles and advances assignment status through the lifecycle.
 */
import { PageHeader } from '@/components/shared/page-header'
import {
  getAvailableDrivers,
  getCampaignsForMatching,
  getContractsByCampaign,
} from '@/lib/admin/queries-contracts'

import { ContractsClient } from './contracts-client'

export const metadata = { title: 'Admin · Campaigns' }

export default async function ContractsPage() {
  const [campaigns, drivers] = await Promise.all([getCampaignsForMatching(), getAvailableDrivers()])

  // Fetch contracts for all campaigns in parallel
  const contractEntries = await Promise.all(
    campaigns.map(async (c) => [c.id, await getContractsByCampaign(c.id)] as const),
  )
  const contractsByCampaign = Object.fromEntries(contractEntries)

  return (
    <div className="space-y-6">
      <PageHeader kicker="Operations" title="Campaigns" />
      <ContractsClient
        campaigns={campaigns}
        contractsByCampaign={contractsByCampaign}
        drivers={drivers}
      />
    </div>
  )
}
