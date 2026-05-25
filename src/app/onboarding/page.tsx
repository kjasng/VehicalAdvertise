import { redirect } from 'next/navigation'

import { getCurrentUserRole, homeForRole } from '@/lib/auth/role-gate'

import { RoleForm } from './role-form'
import { WelcomeDialog } from './welcome-dialog'

export const metadata = { title: 'Choose your role · Wheels Earner' }

export default async function OnboardingPage() {
  const role = await getCurrentUserRole()

  // Gate: only pending users land here. Signed-out users go to login;
  // anyone with an assigned role is bounced to their dashboard so they
  // can't re-pick a role from /onboarding.
  if (role === null) {
    redirect('/login')
  }
  if (role !== 'pending') {
    redirect(homeForRole(role))
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-[#1a1a1a] text-white">
      <RoleForm />
      <WelcomeDialog />
    </div>
  )
}
