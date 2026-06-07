import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

import { PrintPageButton } from '@/components/admin/print-page-button'
import { PageHeader } from '@/components/shared/page-header'
import { PrintIsolationStyles } from '@/components/shared/print-isolation-styles'
import { buildPartnerInvoiceHtml } from '@/lib/partner/invoice-html'
import { getPartnerCampaignInvoices } from '@/lib/partner/queries-invoices'
import { getCompanyInfo } from '@/lib/shared/vn-doc/company-info'

export const metadata = { title: 'Partner · Print Invoice' }

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PartnerInvoicePrintPage({ params }: PageProps) {
  const { id } = await params
  const data = await getPartnerCampaignInvoices()
  if (!data) redirect('/login')

  const row = data.rows.find((invoice) => invoice.id === id)
  if (!row) notFound()

  const docHtml = buildPartnerInvoiceHtml({
    invoiceNumber: `PINV-CAMP-${row.startDate.replaceAll('-', '')}-${row.id.slice(0, 8).toUpperCase()}`,
    issuedAt: new Date().toISOString(),
    company: getCompanyInfo(),
    partnerName: data.partner.companyName,
    partnerTaxCode: data.partner.taxCode,
    billingAddress: data.partner.billingAddress,
    campaignName: row.name,
    periodStart: row.startDate,
    periodEnd: row.endDate,
    amountVnd: row.budgetVnd,
    summaryItems: [
      { label: 'Ngân sách chiến dịch đã giữ', amountVnd: row.budgetVnd },
      { label: 'Chi trả tài xế đã ghi nhận', amountVnd: row.driverPaidVnd },
      { label: 'Chi trả garage đã ghi nhận', amountVnd: row.garagePaidVnd },
      { label: 'Phí nền tảng đã ghi nhận', amountVnd: row.platformFeeVnd },
      { label: 'Ngân sách còn lại sau chi phí', amountVnd: row.remainingVnd },
    ],
    detailLines: row.lines.map((line) => ({
      label: line.label,
      recipientName: line.recipientName,
      vehiclePlate: line.vehiclePlate,
      periodLabel: line.periodLabel,
      driverNetVnd: line.driverNetVnd,
      platformFeeVnd: line.platformFeeVnd,
      garageVnd: line.garageVnd,
      amountVnd: line.amountVnd,
      status: line.status,
    })),
  })

  return (
    <div className="space-y-6">
      <PrintIsolationStyles />
      <PageHeader
        kicker="Invoices"
        title={`Invoice · ${row.name}`}
        cta={
          <div className="flex gap-2 print:hidden">
            <Link
              href="/partner/invoices"
              className="inline-flex h-10 items-center gap-2 rounded border border-[#cbccc9] px-3 text-[12px] font-bold tracking-[1px] text-[#1a1a1a] uppercase hover:bg-[#f7f8fa]"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back
            </Link>
            <PrintPageButton label="Print/PDF" />
          </div>
        }
      />

      <div
        className="print-document rounded-md border border-[#cbccc9] bg-white p-5 print:border-0 print:p-0"
        dangerouslySetInnerHTML={{ __html: docHtml }}
      />
    </div>
  )
}
