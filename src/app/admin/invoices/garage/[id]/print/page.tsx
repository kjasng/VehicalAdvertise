import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

import { PrintPageButton } from '@/components/admin/print-page-button'
import { PageHeader } from '@/components/shared/page-header'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export const metadata = { title: 'Admin · Print Garage Withdrawal' }

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function GarageWithdrawalPrintPage({ params }: PageProps) {
  const { id } = await params
  const supabase = createSupabaseAdminClient()
  const { data: withdrawal } = await supabase
    .from('garage_withdrawals')
    .select('withdrawal_number, invoice_html')
    .eq('id', id)
    .maybeSingle()

  if (!withdrawal) notFound()

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Money"
        title={`Hóa đơn rút tiền #${withdrawal.withdrawal_number}`}
        cta={
          <div className="flex gap-2 print:hidden">
            <Link
              href="/admin/invoices/garage"
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
        dangerouslySetInnerHTML={{ __html: withdrawal.invoice_html }}
      />
    </div>
  )
}
