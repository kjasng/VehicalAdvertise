import { redirect } from 'next/navigation'

import { PlanPackageGrid } from '@/components/partner/plan-package-grid'
import { PageHeader } from '@/components/shared/page-header'
import { SectionShell } from '@/components/shared/section-shell'
import { getPartnerData } from '@/lib/partner/queries'

export const metadata = { title: 'Partner · Plan' }

export default async function PartnerBillingPage() {
  const data = await getPartnerData()
  if (!data) redirect('/login')

  return (
    <div className="space-y-8">
      <PageHeader kicker="Partner" title="Plan" />

      <SectionShell title="Plans">
        <PlanPackageGrid
          taxCode={data.taxCode}
          bankCode={process.env.SEPAY_TOPUP_BANK_CODE?.trim() || undefined}
          bankName={process.env.SEPAY_TOPUP_BANK_NAME?.trim() || undefined}
          bankAccount={process.env.SEPAY_TOPUP_BANK_ACCOUNT?.trim() || undefined}
          accountName={process.env.SEPAY_TOPUP_ACCOUNT_NAME?.trim() || undefined}
        />
      </SectionShell>
    </div>
  )
}
