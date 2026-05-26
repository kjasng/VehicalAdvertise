/**
 * Partner Billing — VietQR top-up card + full ledger history.
 * TopupQrCard is a client component (amount state + QR render).
 */
import { LedgerTable } from '@/components/partner/ledger-table'
import { MOCK_PARTNER_LEDGER, MOCK_WALLET } from '@/components/partner/mock-data'
import { TopupQrCard } from '@/components/partner/topup-qr-card'
import { DemoBadge } from '@/components/shared/demo-badge'
import { PageHeader } from '@/components/shared/page-header'
import { SectionShell } from '@/components/shared/section-shell'

export const metadata = { title: 'Partner · Billing' }

export default function PartnerBillingPage() {
  return (
    <div className="space-y-8">
      <PageHeader kicker="Money" title="Billing" />

      {/* Wallet balance summary */}
      <div className="flex items-baseline gap-3">
        <p className="text-[11px] font-bold tracking-[2.5px] text-[#666666] uppercase">
          Wallet Balance
        </p>
        <p className="font-heading text-[40px] leading-none text-[#1a1a1a]">
          ₫{MOCK_WALLET.balanceVnd.toLocaleString('vi-VN')}
        </p>
        <DemoBadge />
      </div>

      {/* Top-up QR */}
      <SectionShell title="Top Up">
        <TopupQrCard />
      </SectionShell>

      {/* Full ledger */}
      <SectionShell title="Ledger History">
        <LedgerTable rows={MOCK_PARTNER_LEDGER} />
      </SectionShell>
    </div>
  )
}
