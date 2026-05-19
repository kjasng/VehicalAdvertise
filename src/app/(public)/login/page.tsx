import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { OAuthButtons } from './oauth-buttons'

export const metadata = { title: 'Sign in · Wheels Earner' }

export default function LoginPage() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Wheels Earner</CardTitle>
        <CardDescription>
          Sign in to continue. New here? You will pick your role on the next screen.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <OAuthButtons />
      </CardContent>
    </Card>
  )
}
