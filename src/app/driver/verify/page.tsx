/**
 * Driver Verify — server component checks KYC status before rendering.
 * - pending + has photos submitted → show waiting screen (prevents re-submit on reload)
 * - rejected                       → show wizard with rejection banner
 * - pending + no photos            → show wizard (first submission)
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

  const [profileRes, photosRes] = await Promise.all([
    supabase.from('profiles').select('kyc_status').eq('id', user.id).single(),
    supabase
      .from('photos')
      .select('id')
      .eq('subject_id', user.id)
      .in('kind', ['kyc_cccd_front', 'kyc_cccd_back', 'kyc_selfie'])
      .eq('status', 'pending')
      .limit(1),
  ])

  const kycStatus = profileRes.data?.kyc_status ?? 'pending'
  const hasSubmitted = (photosRes.data?.length ?? 0) > 0

  // Approved → proxy handles redirect, but guard here too
  if (kycStatus === 'approved') redirect('/driver/dashboard')

  // Pending + photos already submitted → waiting screen (no wizard)
  const showWaiting = kycStatus === 'pending' && hasSubmitted

  return (
    <div className="space-y-6">
      <PageHeader kicker="ONBOARDING" title="Verify" />

      <div className="mx-auto max-w-[640px]">
        <SectionShell>
          {showWaiting ? (
            <div className="flex flex-col items-center gap-5 py-10 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="size-8 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="space-y-2">
                <h2 className="font-heading text-[22px] leading-none text-[#1a1a1a] uppercase">
                  Đã gửi hồ sơ
                </h2>
                <p className="max-w-[360px] text-[14px] leading-[1.6] text-[#666666]">
                  Hồ sơ của bạn đang được xem xét. Chúng tôi sẽ thông báo qua email trong vòng{' '}
                  <strong>24 giờ</strong>.
                </p>
              </div>
              <p className="text-[12px] text-[#999]">Bạn có thể đóng trang này.</p>
            </div>
          ) : (
            <KycWizard rejected={kycStatus === 'rejected'} />
          )}
        </SectionShell>
      </div>
    </div>
  )
}
