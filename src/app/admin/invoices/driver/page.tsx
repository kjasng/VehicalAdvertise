/**
 * Driver Invoices — printable driver withdrawal invoices.
 */
import { InvoiceTable } from '@/components/admin/invoice-table'
import { PageHeader } from '@/components/shared/page-header'
import { SectionShell } from '@/components/shared/section-shell'
import { getDriverInvoices } from '@/lib/admin/queries-invoices'
import { getWithdrawalRequests } from '@/lib/admin/queries-withdrawal-requests'

import { WithdrawalRequestsTable } from '../../payouts/payouts-client'

export const metadata = { title: 'Admin · Driver Invoices' }

export default async function DriverInvoicesPage() {
  const [rows, withdrawalRequests] = await Promise.all([
    getDriverInvoices(),
    getWithdrawalRequests({ role: 'driver' }),
  ])

  return (
    <div className="space-y-6">
      <PageHeader kicker="Money" title="Driver Invoices" />
      <WithdrawalRequestsTable
        rows={withdrawalRequests}
        title="Driver Withdrawal Requests"
        lockedRole="driver"
        emptyTitle="No Driver Withdrawal Requests"
        emptyHelper="Driver withdrawal requests will appear here."
      />
      <SectionShell title="Driver Invoice History">
        <InvoiceTable rows={rows} />
      </SectionShell>
    </div>
  )
}
