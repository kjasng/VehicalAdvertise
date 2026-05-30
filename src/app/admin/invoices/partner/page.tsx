/**
 * Partner Invoices — partner top-up and charge ledger entries.
 */
import { InvoiceTable } from '@/components/admin/invoice-table'
import { PageHeader } from '@/components/shared/page-header'
import { SectionShell } from '@/components/shared/section-shell'
import { getPartnerInvoices } from '@/lib/admin/queries-invoices'

export const metadata = { title: 'Admin · Partner Invoices' }

export default async function PartnerInvoicesPage() {
  const rows = await getPartnerInvoices()

  return (
    <div className="space-y-6">
      <PageHeader kicker="Money" title="Partner Invoices" />
      <SectionShell title="Top-ups & Charges">
        <InvoiceTable rows={rows} />
      </SectionShell>
    </div>
  )
}
