import Link from 'next/link'

import { AuthShell } from '../auth-shell'
import { ForgotPasswordForm } from './forgot-form'

export const metadata = { title: 'Reset password · VehicalAdvertise' }

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      visualSide="right"
      visualTitle={'RECOVER ACCESS\nSTAY ON ROUTE'}
      visualCopy="Send yourself a recovery link to regain access. Your vehicle verification and approved decals stay intact."
      heroSrc="/landing/pencil/driver-hero.png"
      heroAlt="Vehicle with approved side ad"
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-[32px] leading-none text-[#1a1a1a]">Reset password</h1>
          <p className="text-[15px] leading-[1.4] text-[#666666]">
            Enter the email tied to your account and we&apos;ll send a recovery link.
          </p>
        </div>

        <ForgotPasswordForm />

        <p className="text-center text-sm text-[#666666]">
          Remembered it?{' '}
          <Link href="/login" className="text-primary font-semibold hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </AuthShell>
  )
}
