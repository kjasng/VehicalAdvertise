import { redirect } from 'next/navigation'

import { LedgerTable } from '@/components/partner/ledger-table'
import { TopupQrCard } from '@/components/partner/topup-qr-card'
import { PageHeader } from '@/components/shared/page-header'
import { SectionShell } from '@/components/shared/section-shell'
import { PARTNER_MIN_DEPOSIT_VND } from '@/lib/partner/constants'
import { getPartnerData } from '@/lib/partner/queries'

export const metadata = { title: 'Partner · Billing' }

export default async function PartnerBillingPage() {
  const data = await getPartnerData()
  if (!data) redirect('/login')

  return (
    <div className="space-y-8">
      <PageHeader kicker="Money" title="Billing" />

      <div className="flex flex-wrap items-baseline gap-3">
        <p className="text-[11px] font-bold tracking-[2.5px] text-[#666666] uppercase">
          Wallet Balance
        </p>
        <p className="font-heading text-[40px] leading-none text-[#1a1a1a]">
          ₫{data.balanceVnd.toLocaleString('vi-VN')}
        </p>
        <p className="text-[12px] text-[#666666]">
          Minimum deposit: ₫{PARTNER_MIN_DEPOSIT_VND.toLocaleString('vi-VN')}
        </p>
      </div>

      <SectionShell title="Top Up">
        <TopupQrCard partnerId={data.partnerId} />
      </SectionShell>

      <SectionShell title="Ledger History">
        <LedgerTable rows={data.ledger} />
      </SectionShell>
    </div>
  )
}
