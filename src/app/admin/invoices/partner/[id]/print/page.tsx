import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

import { PrintPageButton } from '@/components/admin/print-page-button'
import { PageHeader } from '@/components/shared/page-header'
import { escapeHtml, formatVnd } from '@/lib/driver/monthly-earning'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export const metadata = { title: 'Admin · Print Partner Invoice' }

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PartnerInvoicePrintPage({ params }: PageProps) {
  const { id } = await params
  const data = await getPartnerInvoiceData(id)
  if (!data) notFound()

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Money"
        title={data.invoiceNumber}
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
        className="rounded-md border border-[#cbccc9] bg-white p-5 print:border-0 print:p-0"
        dangerouslySetInnerHTML={{ __html: buildPartnerInvoiceHtml(data) }}
      />
    </div>
  )
}

async function getPartnerInvoiceData(id: string) {
  const supabase = createSupabaseAdminClient()
  const { data: period } = await supabase
    .from('driver_earning_periods')
    .select(
      'id, campaign_id, driver_id, period_start, period_end, gross_charge_vnd, platform_fee_vnd, driver_net_vnd, created_at',
    )
    .eq('id', id)
    .maybeSingle()

  if (!period) return null

  const [{ data: campaign }, { data: driver }] = await Promise.all([
    supabase
      .from('campaigns')
      .select('id, name, partner_id, partners(company_name, billing_address)')
      .eq('id', period.campaign_id)
      .maybeSingle(),
    supabase.from('profiles').select('full_name').eq('id', period.driver_id).maybeSingle(),
  ])

  const partner = Array.isArray(campaign?.partners) ? campaign?.partners[0] : campaign?.partners

  return {
    invoiceNumber: `PINV-${period.period_start.replaceAll('-', '')}-${period.id.slice(0, 8).toUpperCase()}`,
    issuedAt: period.created_at,
    partnerName: partner?.company_name ?? 'Unknown partner',
    billingAddress: partner?.billing_address ?? '—',
    campaignName: campaign?.name ?? 'Campaign',
    driverName: driver?.full_name ?? 'Driver',
    periodStart: period.period_start,
    periodEnd: period.period_end,
    grossChargeVnd: period.gross_charge_vnd,
    platformFeeVnd: period.platform_fee_vnd,
    driverNetVnd: period.driver_net_vnd,
  }
}

function buildPartnerInvoiceHtml(
  input: NonNullable<Awaited<ReturnType<typeof getPartnerInvoiceData>>>,
) {
  return `
<article class="invoice-doc">
  <style>
    .invoice-doc{font-family:Arial,sans-serif;color:#1a1a1a;max-width:820px;margin:0 auto;padding:32px}
    .invoice-doc h1{font-size:28px;margin:0 0 8px;text-transform:uppercase}
    .invoice-doc h2{font-size:14px;margin:24px 0 8px;text-transform:uppercase;letter-spacing:1.5px}
    .invoice-doc p,.invoice-doc td,.invoice-doc th{font-size:13px;line-height:1.5}
    .invoice-doc table{width:100%;border-collapse:collapse;margin-top:8px}
    .invoice-doc th,.invoice-doc td{border:1px solid #cbccc9;padding:10px;text-align:left}
    .invoice-doc th{background:#f7f8fa;text-transform:uppercase;font-size:11px;letter-spacing:1px}
    .invoice-doc .total{font-size:22px;font-weight:700}
    @media print{.invoice-doc{padding:0}.no-print{display:none}}
  </style>
  <h1>Partner Campaign Invoice</h1>
  <p><strong>No:</strong> ${escapeHtml(input.invoiceNumber)}</p>
  <p><strong>Issued:</strong> ${escapeHtml(input.issuedAt.slice(0, 10))}</p>

  <h2>Partner</h2>
  <table>
    <tr><th>Company</th><td>${escapeHtml(input.partnerName)}</td></tr>
    <tr><th>Billing Address</th><td>${escapeHtml(input.billingAddress)}</td></tr>
  </table>

  <h2>Campaign Period</h2>
  <table>
    <tr><th>Campaign</th><td>${escapeHtml(input.campaignName)}</td></tr>
    <tr><th>Driver</th><td>${escapeHtml(input.driverName)}</td></tr>
    <tr><th>Period</th><td>${escapeHtml(input.periodStart)} → ${escapeHtml(input.periodEnd)}</td></tr>
    <tr><th>Gross Charge</th><td class="total">${escapeHtml(formatVnd(input.grossChargeVnd))}</td></tr>
    <tr><th>Platform Fee</th><td>${escapeHtml(formatVnd(input.platformFeeVnd))}</td></tr>
    <tr><th>Driver Net</th><td>${escapeHtml(formatVnd(input.driverNetVnd))}</td></tr>
  </table>
</article>`.trim()
}
