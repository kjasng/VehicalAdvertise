/**
 * Partner Invoices — monthly charge invoice table with filters.
 */
import { DemoBadge } from '@/components/admin/demo-badge'
import { InvoiceTable } from '@/components/admin/invoice-table'
import { MOCK_PARTNER_INVOICES } from '@/components/admin/mock-data'
import { PageHeader } from '@/components/shared/page-header'
import { SectionShell } from '@/components/shared/section-shell'

export const metadata = { title: 'Admin · Partner Invoices' }

export default function PartnerInvoicesPage() {
  return (
    <div className="space-y-6">
      <PageHeader kicker="Money" title="Partner Invoices" />
      <SectionShell title="Monthly Charges" action={<DemoBadge />}>
        <InvoiceTable rows={MOCK_PARTNER_INVOICES} />
      </SectionShell>
    </div>
  )
}
