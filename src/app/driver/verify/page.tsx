/**
 * Driver Verify — KYC onboarding flow.
 * 3-step wizard: CCCD upload → selfie → vehicle photos.
 * KycWizard is a client component; this page is a server wrapper.
 * Desktop: centered max-w-[640px] column — comfortable form width, not full-bleed.
 */
import { KycWizard } from '@/components/driver/kyc-wizard'
import { PageHeader } from '@/components/shared/page-header'
import { SectionShell } from '@/components/shared/section-shell'

export const metadata = { title: 'Driver · Verify' }

export default function DriverVerifyPage() {
  return (
    <div className="space-y-6">
      <PageHeader kicker="ONBOARDING" title="Verify" />

      <div className="mx-auto max-w-[640px]">
        <SectionShell>
          <KycWizard />
        </SectionShell>
      </div>
    </div>
  )
}
