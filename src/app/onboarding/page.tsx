import { redirect } from 'next/navigation'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getCurrentUserRole, homeForRole } from '@/lib/auth/role-gate'

import { RoleForm } from './role-form'

export const metadata = { title: 'Choose your role · Wheels Earner' }

export default async function OnboardingPage() {
  const role = await getCurrentUserRole()

  if (role === null) {
    redirect('/login')
  }
  if (role !== 'pending') {
    redirect(homeForRole(role))
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Welcome</CardTitle>
        <CardDescription>How do you plan to use Wheels Earner?</CardDescription>
      </CardHeader>
      <CardContent>
        <RoleForm />
      </CardContent>
    </Card>
  )
}
