import Link from 'next/link'

import { AuthShell } from '../auth-shell'
import { EmailSignInForm } from './email-sign-in-form'
import { OAuthButtons } from './oauth-buttons'

export const metadata = { title: 'Sign in · VehicalAdvertise' }

export default function LoginPage() {
  return (
    <AuthShell
      visualSide="right"
      visualTitle={'SECURE AUTH\nFOR VEHICLE ADS'}
      visualCopy="Access your account after vehicle and decal verification. Approved ads stay on the vehicle side area and keep the front, rear, roof, glass, lights, and plates clear."
      heroSrc="/landing/pencil/driver-hero.png"
      heroAlt="Vehicle with approved side ad"
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-[32px] leading-none text-[#1a1a1a]">Login</h1>
          <p className="text-[15px] leading-[1.4] text-[#666666]">
            Sign in to access your VA workspace.
          </p>
        </div>

        <EmailSignInForm />

        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-[#e8e8e8]" />
          <span className="text-[13px] text-[#666666]">or</span>
          <span className="h-px flex-1 bg-[#e8e8e8]" />
        </div>

        <OAuthButtons />

        <p className="text-center text-sm text-[#666666]">
          Need an account?{' '}
          <Link href="/signup" className="text-primary font-semibold hover:underline">
            Sign up
          </Link>
        </p>
        <p className="text-center text-xs text-[#999999]">
          Account access is provided after account approval.
        </p>
      </div>
    </AuthShell>
  )
}
