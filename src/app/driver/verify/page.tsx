/**
 * Driver Verify — server component checks KYC status before rendering.
 * - approved → redirect to profile
 * - rejected → show wizard with rejection banner
 * - pending  → show wizard (auto-approve on submit, no waiting state)
 */
import { redirect } from 'next/navigation'

import { KycWizard } from '@/components/driver/kyc-wizard'
import { PageHeader } from '@/components/shared/page-header'
import { SectionShell } from '@/components/shared/section-shell'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const metadata = { title: 'Driver · Verify' }

export default async function DriverVerifyPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('kyc_status')
    .eq('id', user.id)
    .single()

  const kycStatus = profile?.kyc_status ?? 'pending'

  // Approved → proxy handles redirect, but guard here too
  if (kycStatus === 'approved') redirect('/driver/profile')

  return (
    <div className="space-y-6">
      <PageHeader kicker="ONBOARDING" title="Verify" />

      <div className="mx-auto max-w-[640px]">
        <SectionShell>
          <KycWizard rejected={kycStatus === 'rejected'} />
        </SectionShell>
      </div>
    </div>
  )
}
