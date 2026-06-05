import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

import { PrintPageButton } from '@/components/admin/print-page-button'
import { PageHeader } from '@/components/shared/page-header'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export const metadata = { title: 'Admin · Print Driver Invoice' }

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function DriverInvoicePrintPage({ params }: PageProps) {
  const { id } = await params
  const supabase = createSupabaseAdminClient()
  const { data: invoice } = await supabase
    .from('driver_invoices')
    .select('invoice_number, invoice_html')
    .eq('id', id)
    .maybeSingle()

  if (!invoice) notFound()

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Money"
        title={`Hóa đơn rút tiền #${invoice.invoice_number}`}
        cta={
          <div className="flex gap-2 print:hidden">
            <Link
              href="/admin/invoices/driver"
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
        dangerouslySetInnerHTML={{ __html: invoice.invoice_html }}
      />
    </div>
  )
}
