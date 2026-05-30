/**
 * Install Proofs — garage installation photo review.
 * Server component: fetches real proofs. Interactive grid in InstallProofsClient.
 */
import { PageHeader } from '@/components/shared/page-header'
import { getInstallProofs } from '@/lib/admin/queries-photos'

import { InstallProofsClient } from './install-proofs-client'

export const metadata = { title: 'Admin · Install Proofs' }

export default async function InstallProofsPage() {
  const rows = await getInstallProofs()
  const garages = [...new Set(rows.map((r) => r.garageName))]

  return (
    <div className="space-y-6">
      <PageHeader kicker="Operations" title="Install Proofs" />
      <InstallProofsClient rows={rows} garages={garages} />
    </div>
  )
}
