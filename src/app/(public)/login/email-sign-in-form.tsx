'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
  password: z.string().min(1, 'Enter your password'),
  remember: z.boolean().optional(),
})

type FormValues = z.infer<typeof schema>

// Matches the Pencil "Login" form panel: 13/500 labels, 44px inputs with
// #E0E0E0 borders, remember+reset row, orange Sign In button.
export function EmailSignInForm() {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '', remember: false },
  })

  const onSubmit = async ({ email, password }: FormValues) => {
    setBusy(true)
    try {
      const supabase = createSupabaseBrowserClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      router.replace('/onboarding')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Sign-in failed')
      setBusy(false)
    }
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
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="gap-1.5">
              <FormLabel className="text-[13px] font-medium text-[#1a1a1a]">Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  disabled={busy}
                  className="h-11 rounded-lg border-[#e0e0e0] px-3.5 text-sm placeholder:text-[#999999]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex items-center justify-between">
          <FormField
            control={form.control}
            name="remember"
            render={({ field }) => (
              <label className="flex items-center gap-2 text-[13px] text-[#666666]">
                <input
                  type="checkbox"
                  className="text-primary focus:ring-primary size-4 rounded border-[#cccccc]"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  disabled={busy}
                />
                Keep me signed in
              </label>
            )}
          />
          <Link
            href="/forgot-password"
            className="text-primary text-[13px] font-medium hover:underline"
          >
            Reset password
          </Link>
        </div>
        <Button
          type="submit"
          className="bg-primary hover:bg-primary/90 h-12 w-full rounded-[10px] text-base font-semibold"
          disabled={busy}
        >
          {busy ? 'Signing in…' : 'Sign In'}
        </Button>
      </form>
    </Form>
  )
}
