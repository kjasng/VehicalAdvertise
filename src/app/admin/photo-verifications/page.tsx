/**
 * Photo Verifications — driver daily photo prompt review.
 * Delegates to PhotoVerifQueueClient for drawer + approve/reject UI.
 */
import { PageHeader } from '@/components/shared/page-header'
import { getPhotoVerifications } from '@/lib/admin/queries-photos'

import { PhotoVerifQueueClient } from './photo-verif-queue-client'

export const metadata = { title: 'Admin · Photo Verifications' }

export default async function PhotoVerificationsPage() {
  const rows = await getPhotoVerifications()

  return (
    <div className="space-y-6">
      <PageHeader kicker="Operations" title="Photo Verifications" />
      <PhotoVerifQueueClient rows={rows} />
    </div>
  )
}
