'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
})

type FormValues = z.infer<typeof schema>

// Reuses the auth-form styling tokens (44px inputs with #E0E0E0 borders,
// orange 48px primary button) so it sits naturally inside AuthShell.
export function ForgotPasswordForm() {
  const [busy, setBusy] = useState(false)
  const [sentTo, setSentTo] = useState<string | null>(null)
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  })

  const onSubmit = async ({ email }: FormValues) => {
    setBusy(true)
    try {
      const supabase = createSupabaseBrowserClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        // /reset-password is the form that swaps the password once the
        // recovery session is established by /auth/callback.
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      })
      if (error) throw error
      setSentTo(email)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not send reset email')
    } finally {
      setBusy(false)
    }
  }

  if (sentTo) {
    return (
      <div className="rounded-lg border border-[#e0e0e0] bg-[#fafafa] p-5 text-sm">
        <p className="mb-1 font-semibold text-[#1a1a1a]">Check your email</p>
        <p className="text-[#666666]">
          If an account exists for <span className="font-mono">{sentTo}</span>, a reset link is on
          the way. The link expires in 60 minutes.
        </p>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="gap-1.5">
              <FormLabel className="text-[13px] font-medium text-[#1a1a1a]">Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  autoComplete="email"
                  placeholder="abc@example.com"
                  disabled={busy}
                  className="h-11 rounded-lg border-[#e0e0e0] px-3.5 text-sm placeholder:text-[#999999]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="bg-primary hover:bg-primary/90 h-12 w-full rounded-[10px] text-base font-semibold"
          disabled={busy}
        >
          {busy ? 'Sending link…' : 'Send reset link'}
        </Button>
      </form>
    </Form>
  )
}
