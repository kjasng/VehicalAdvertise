import Link from 'next/link'

import { OAuthButtons } from '../login/oauth-buttons'
import { AuthShell } from '../auth-shell'
import { SignUpForm } from './signup-form'

export const metadata = { title: 'Create account · VehicalAdvertise' }

export default function SignUpPage() {
  return (
    <AuthShell
      visualSide="left"
      visualTitle={'AUTHENTICATE\nBEFORE YOU DRIVE'}
      visualCopy="Create an account, submit vehicle details, and prepare a compliant side decal for approval before campaigns launch."
      heroSrc="/landing/pencil/driver.jpg"
      heroAlt="Driver registering vehicle for ads"
    >
      <div className="flex flex-col gap-[22px]">
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-[32px] leading-none text-[#1a1a1a]">Sign up</h1>
          <p className="text-[15px] leading-[1.4] text-[#666666]">
            Create your auth profile for vehicle verification and decal compliance review.
          </p>
        </div>

        <SignUpForm />

        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-[#e8e8e8]" />
          <span className="text-[13px] text-[#666666]">or</span>
          <span className="h-px flex-1 bg-[#e8e8e8]" />
        </div>

        <OAuthButtons />

        <p className="text-center text-sm text-[#666666]">
          Already approved?{' '}
          <Link href="/login" className="text-primary font-semibold hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </AuthShell>
  )
}
