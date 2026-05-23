'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

const schema = z
  .object({
    password: z.string().min(8, 'At least 8 characters'),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],
  })

type FormValues = z.infer<typeof schema>

// Called once the recovery session has been established by /auth/callback.
// Swaps the password via supabase.auth.updateUser, then bounces to /onboarding
// where the role-gate routes the user to their dashboard.
export function ResetPasswordForm() {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirm: '' },
  })

  const onSubmit = async ({ password }: FormValues) => {
    setBusy(true)
    try {
      const supabase = createSupabaseBrowserClient()
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      toast.success('Password updated. Welcome back.')
      router.replace('/onboarding')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update password')
      setBusy(false)
    }
  }

  const inputClass = 'h-11 rounded-lg border-[#e0e0e0] px-3.5 text-sm placeholder:text-[#999999]'
  const labelClass = 'text-[13px] font-medium text-[#1a1a1a]'

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="gap-1.5">
              <FormLabel className={labelClass}>New password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  disabled={busy}
                  className={inputClass}
                  {...field}
                />
              </FormControl>
              <FormDescription>At least 8 characters.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirm"
          render={({ field }) => (
            <FormItem className="gap-1.5">
              <FormLabel className={labelClass}>Confirm password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  disabled={busy}
                  className={inputClass}
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
          {busy ? 'Updating…' : 'Update password'}
        </Button>
      </form>
    </Form>
  )
}
