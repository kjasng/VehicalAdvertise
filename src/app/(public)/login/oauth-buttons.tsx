'use client'

import { useState } from 'react'
import { toast } from 'sonner'

import { createSupabaseBrowserClient } from '@/lib/supabase/client'

// Single Google button matching the Pencil auth design (h-12, rounded-[10px],
// inline "G" mark + label). GitHub OAuth is intentionally removed.
export function OAuthButtons() {
  const [busy, setBusy] = useState(false)

  const onClick = async () => {
    setBusy(true)
    try {
      const supabase = createSupabaseBrowserClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
      // signInWithOAuth navigates the window via 302; we only land here on error.
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Sign-in failed')
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="flex h-12 w-full items-center justify-center gap-2.5 rounded-[10px] border border-[#e0e0e0] bg-white text-[15px] text-[#1a1a1a] transition hover:bg-[#fafafa] disabled:opacity-60"
    >
      <span className="text-[18px] font-bold">G</span>
      <span>{busy ? 'Redirecting…' : 'Continue with Google'}</span>
    </button>
  )
}
