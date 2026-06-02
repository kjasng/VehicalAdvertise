/**
 * Driver Invoices — payout request ledger entries.
 */
import { InvoiceTable } from '@/components/admin/invoice-table'
import { PageHeader } from '@/components/shared/page-header'
import { SectionShell } from '@/components/shared/section-shell'
import { getDriverInvoices } from '@/lib/admin/queries-invoices'

export const metadata = { title: 'Admin · Driver Invoices' }

export default async function DriverInvoicesPage() {
  const rows = await getDriverInvoices()

  return (
    <div className="space-y-6">
      <PageHeader kicker="Money" title="Driver Invoices" />
      <SectionShell title="Payout Requests">
        <InvoiceTable rows={rows} />
      </SectionShell>
    </div>
  )
}
