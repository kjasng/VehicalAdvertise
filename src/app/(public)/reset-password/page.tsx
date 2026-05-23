import Link from 'next/link'
import { redirect } from 'next/navigation'

import { createSupabaseServerClient } from '@/lib/supabase/server'

import { AuthShell } from '../auth-shell'
import { ResetPasswordForm } from './reset-form'

export const metadata = { title: 'Set new password · VehicalAdvertise' }

export default async function ResetPasswordPage() {
  // Recovery sessions arrive here after /auth/callback exchanges the email
  // link's code. Bounce anyone without any session back to the request page.
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase.auth.getUser()
  if (!data.user) {
    redirect('/forgot-password')
  }

  return (
    <AuthShell
      visualSide="right"
      visualTitle={'NEW PASSWORD\nNEW KEY'}
      visualCopy="Pick a strong password and sign back into your verified workspace."
      heroSrc="/landing/pencil/driver-hero.png"
      heroAlt="Vehicle with approved side ad"
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-[32px] leading-none text-[#1a1a1a]">Set new password</h1>
          <p className="text-[15px] leading-[1.4] text-[#666666]">
            Choose a fresh password to finish recovering your account.
          </p>
        </div>

        <ResetPasswordForm />

        <p className="text-center text-sm text-[#666666]">
          Changed your mind?{' '}
          <Link href="/login" className="text-primary font-semibold hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </AuthShell>
  )
}
