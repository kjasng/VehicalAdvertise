/**
 * Garage Invoices — weekly payout invoice table with filters.
 */
import { DemoBadge } from '@/components/admin/demo-badge'
import { InvoiceTable } from '@/components/admin/invoice-table'
import { MOCK_GARAGE_INVOICES } from '@/components/admin/mock-data'
import { PageHeader } from '@/components/shared/page-header'
import { SectionShell } from '@/components/shared/section-shell'

export const metadata = { title: 'Admin · Garage Invoices' }

export default function GarageInvoicesPage() {
  return (
    <div className="space-y-6">
      <PageHeader kicker="Money" title="Garage Invoices" />
      <SectionShell title="Weekly Payouts" action={<DemoBadge />}>
        <InvoiceTable rows={MOCK_GARAGE_INVOICES} />
      </SectionShell>
    </div>
  )
}
