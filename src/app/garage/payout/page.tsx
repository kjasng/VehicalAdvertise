import { redirect } from 'next/navigation'

import { GarageInvoicesClient } from '@/components/garage/garage-invoices-client'
import { PageHeader } from '@/components/shared/page-header'
import { getGaragePayoutData } from '@/lib/garage/queries-payout'

export const metadata = { title: 'Garage · Invoices' }

export default async function GarageInvoicesPage() {
  const data = await getGaragePayoutData()
  if (!data) redirect('/login')

  return (
    <div className="flex flex-col gap-8">
      <PageHeader kicker="MONEY" title="INVOICES" />

      <GarageInvoicesClient
        profile={data.profile}
        minimumWithdrawalVnd={data.minimumWithdrawalVnd}
        withdrawals={data.withdrawals}
      />
    </div>
  )
}
