/**
 * Garage Invoices — platform fee ledger entries linked to garage contracts.
 * Note: ledger_entries has no garage_id; entries derived via contract chain.
 * Shows empty state when no data — acceptable until P4 contracts land.
 */
import { InvoiceTable } from '@/components/admin/invoice-table'
import { PageHeader } from '@/components/shared/page-header'
import { SectionShell } from '@/components/shared/section-shell'
import { getGarageInvoices } from '@/lib/admin/queries-invoices'

export const metadata = { title: 'Admin · Garage Invoices' }

export default async function GarageInvoicesPage() {
  const rows = await getGarageInvoices()

  return (
    <div className="space-y-6">
      <PageHeader kicker="Money" title="Garage Invoices" />
      <SectionShell title="Platform Fees">
        <InvoiceTable rows={rows} />
      </SectionShell>
    </div>
  )
}
