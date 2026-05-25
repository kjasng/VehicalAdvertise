/**
 * Driver Invoices — weekly payout invoice table with filters.
 */
import { DemoBadge } from '@/components/admin/demo-badge'
import { InvoiceTable } from '@/components/admin/invoice-table'
import { MOCK_DRIVER_INVOICES } from '@/components/admin/mock-data'
import { PageHeader } from '@/components/shared/page-header'
import { SectionShell } from '@/components/shared/section-shell'

export const metadata = { title: 'Admin · Driver Invoices' }

export default function DriverInvoicesPage() {
  return (
    <div className="space-y-6">
      <PageHeader kicker="Money" title="Driver Invoices" />
      <SectionShell title="Weekly Payouts" action={<DemoBadge />}>
        <InvoiceTable rows={MOCK_DRIVER_INVOICES} />
      </SectionShell>
    </div>
  )
}
