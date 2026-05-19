'use client'

import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

type Provider = 'google' | 'github'

const PROVIDERS: { id: Provider; label: string }[] = [
  { id: 'google', label: 'Continue with Google' },
  { id: 'github', label: 'Continue with GitHub' },
]

export function OAuthButtons() {
  const [busy, setBusy] = useState<Provider | null>(null)

  const start = async (provider: Provider) => {
    setBusy(provider)
    try {
      const supabase = createSupabaseBrowserClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
      // signInWithOAuth navigates the window via 302; we only land here on error.
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Sign-in failed')
      setBusy(null)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {PROVIDERS.map(({ id, label }) => (
        <Button
          key={id}
          variant="outline"
          className="w-full"
          disabled={busy !== null}
          onClick={() => start(id)}
        >
          {busy === id ? 'Redirecting…' : label}
        </Button>
      ))}
    </div>
  )
}
