import { redirect } from 'next/navigation'

import { GarageInvoicesClient } from '@/components/garage/garage-invoices-client'
import { EmptyState } from '@/components/shared/empty-state'
import { PageHeader } from '@/components/shared/page-header'
import { getGaragePayoutData } from '@/lib/garage/queries-payout'

export const metadata = { title: 'Garage · Invoices' }

export default async function GarageInvoicesPage() {
  const data = await getGaragePayoutData()
  if (!data) redirect('/login')

  return (
    <div className="flex flex-col gap-8">
      <PageHeader kicker="MONEY" title="INVOICES" />

      {!data.profile.approved ? (
        <EmptyState
          kicker="pending"
          title="Waiting Approval"
          helper="Sau khi admin approve garage, bạn có thể setup payout settings và rút tiền."
        />
      ) : (
        <GarageInvoicesClient
          profile={data.profile}
          minimumWithdrawalVnd={data.minimumWithdrawalVnd}
          withdrawals={data.withdrawals}
        />
      )}
    </div>
  )
}
