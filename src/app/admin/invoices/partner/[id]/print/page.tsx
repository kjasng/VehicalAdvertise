import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

import { PrintPageButton } from '@/components/admin/print-page-button'
import { PageHeader } from '@/components/shared/page-header'
import { PrintIsolationStyles } from '@/components/shared/print-isolation-styles'
import { batchSignUrls } from '@/lib/admin/photo-query-utils'
import {
  buildAcceptanceRecordHtml,
  type AcceptanceVehicle,
} from '@/lib/partner/acceptance-record-html'
import { buildPartnerInvoiceHtml } from '@/lib/partner/invoice-html'
import { getCompanyInfo } from '@/lib/shared/vn-doc/company-info'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export const metadata = { title: 'Admin · Print Partner Invoice' }

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PartnerInvoicePrintPage({ params }: PageProps) {
  const { id } = await params
  const data = await getPartnerInvoiceData(id)
  if (!data) notFound()

  const docHtml = `${buildPartnerInvoiceHtml(data.invoice)}<div class="page-break"></div>${buildAcceptanceRecordHtml(
    data.acceptance,
  )}`

  return (
    <div className="space-y-6">
      <PrintIsolationStyles />
      <PageHeader
        kicker="Money"
        title={data.invoice.invoiceNumber}
        cta={
          <div className="flex gap-2 print:hidden">
            <Link
              href="/admin/invoices/partner"
              className="inline-flex h-10 items-center gap-2 rounded border border-[#cbccc9] px-3 text-[12px] font-bold tracking-[1px] text-[#1a1a1a] uppercase hover:bg-[#f7f8fa]"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back
            </Link>
            <PrintPageButton />
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

async function getPartnerInvoiceData(id: string) {
  const supabase = createSupabaseAdminClient()
  const { data: period } = await supabase
    .from('driver_earning_periods')
    .select('id, campaign_id, driver_id, period_start, period_end, gross_charge_vnd, created_at')
    .eq('id', id)
    .maybeSingle()

  if (!period) return null

  const [{ data: campaign }, { data: driver }, { data: contract }] = await Promise.all([
    supabase
      .from('campaigns')
      .select('id, name, partner_id, partners(company_name, billing_address)')
      .eq('id', period.campaign_id)
      .maybeSingle(),
    supabase.from('profiles').select('full_name').eq('id', period.driver_id).maybeSingle(),
    supabase
      .from('contracts')
      .select('id, installed_at, vehicles(plate)')
      .eq('campaign_id', period.campaign_id)
      .eq('driver_id', period.driver_id)
      .maybeSingle(),
  ])

  const partner = Array.isArray(campaign?.partners) ? campaign?.partners[0] : campaign?.partners
  const vehicle = Array.isArray(contract?.vehicles) ? contract?.vehicles[0] : contract?.vehicles
  const company = getCompanyInfo()
  const partnerName = partner?.company_name ?? 'Unknown partner'
  const campaignName = campaign?.name ?? 'Campaign'
  const driverName = driver?.full_name ?? 'Driver'
  const invoiceNumber = `PINV-${period.period_start.replaceAll('-', '')}-${period.id.slice(0, 8).toUpperCase()}`

  // Approved install-proof photos for the period's contract → signed image URLs.
  const photoUrls: string[] = []
  const vehicles: AcceptanceVehicle[] = []
  if (contract?.id) {
    vehicles.push({
      plate: vehicle?.plate ?? '—',
      driverName,
      installedAt: contract.installed_at,
    })
    const { data: photos } = await supabase
      .from('photos')
      .select('storage_path')
      .eq('kind', 'install_proof')
      .eq('subject_type', 'contract')
      .eq('subject_id', contract.id)
      .eq('status', 'approved')
      .limit(4)
    const signed = await batchSignUrls(
      supabase,
      (photos ?? []).map((p) => p.storage_path),
    )
    photoUrls.push(...Object.values(signed))
  }

  return {
    invoice: {
      invoiceNumber,
      issuedAt: period.created_at,
      company,
      partnerName,
      billingAddress: partner?.billing_address ?? '',
      campaignName,
      periodStart: period.period_start,
      periodEnd: period.period_end,
      amountVnd: period.gross_charge_vnd,
    },
    acceptance: {
      recordNumber: `BBNT-${period.period_start.replaceAll('-', '')}-${period.id.slice(0, 8).toUpperCase()}`,
      issuedAt: period.created_at,
      company,
      partnerName,
      campaignName,
      periodStart: period.period_start,
      periodEnd: period.period_end,
      vehicles,
      photoUrls,
    },
  }
}
