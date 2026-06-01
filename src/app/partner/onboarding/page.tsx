/**
 * Partner Onboarding — server component reads partner status, passes to client form.
 * Possible states: no row → new form | pending → waiting | rejected → form + banner.
 */
import { redirect } from 'next/navigation'

import { createSupabaseServerClient } from '@/lib/supabase/server'

import { PartnerOnboardingForm } from './partner-onboarding-form'

export const metadata = { title: 'Partner · Onboarding' }

export default async function PartnerOnboardingPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch partner + profile (contact info) in parallel
  const [{ data: partner }, { data: profile }] = await Promise.all([
    supabase
      .from('partners')
      .select('company_name, tax_code, billing_address, status, reject_reason')
      .eq('id', user.id)
      .maybeSingle(),
    supabase.from('profiles').select('full_name, phone_e164').eq('id', user.id).maybeSingle(),
  ])

  // Approved partners should not see this page
  if (partner?.status === 'approved') redirect('/partner/dashboard')

  // Only treat as 'pending' if company_name was actually submitted.
  // An empty partners row (no company info) = user hasn't filled the form yet.
  const hasSubmitted = !!partner?.company_name
  const status = !partner || !hasSubmitted ? 'none' : (partner.status as 'pending' | 'rejected')

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f8fa]">
      {/* Top bar */}
      <div className="border-b border-[#e0e0de] bg-white px-6 py-4">
        <p className="font-heading text-[20px] leading-none text-[#1a1a1a]">
          Wheels<span className="text-[#ff5c00]">Earner</span>
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <PartnerOnboardingForm
          status={status}
          rejectReason={partner?.reject_reason ?? null}
          existingData={
            partner
              ? {
                  companyName: partner.company_name,
                  taxCode: partner.tax_code ?? '',
                  billingAddress: partner.billing_address ?? '',
                  contactName: profile?.full_name ?? '',
                  contactPhone: profile?.phone_e164 ?? '',
                }
              : {
                  companyName: '',
                  taxCode: '',
                  billingAddress: '',
                  contactName: profile?.full_name ?? '',
                  contactPhone: profile?.phone_e164 ?? '',
                }
          }
        />
      </div>
    </div>
  )
}
