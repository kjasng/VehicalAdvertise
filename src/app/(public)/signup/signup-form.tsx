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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

const schema = z.object({
  fullName: z.string().min(2, 'Enter your full name'),
  email: z.string().email('Enter a valid email'),
  phone: z
    .string()
    .trim()
    .min(1, 'Enter your phone number')
    .regex(/^[+\d\s-]+$/, 'Digits, spaces, + and - only'),
  password: z.string().min(8, 'At least 8 characters'),
  terms: z.boolean().refine((v) => v === true, {
    message: 'You must agree to verification',
  }),
})

type FormValues = z.infer<typeof schema>

// Matches the Pencil "Sign up" form panel: full name + email + phone + password
// stack, terms checkbox, orange "Create Auth Account" button. Phone + full
// name persist via Supabase user_metadata; the handle_new_user trigger reads
// full_name on the profile insert.
export function SignUpForm() {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [confirmationSent, setConfirmationSent] = useState<string | null>(null)
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: '', email: '', phone: '', password: '', terms: false },
  })

  const onSubmit = async ({ fullName, email, phone, password }: FormValues) => {
    setBusy(true)
    try {
      const supabase = createSupabaseBrowserClient()
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: { full_name: fullName, phone },
        },
      })
      if (error) throw error
      if (!data.session) {
        setConfirmationSent(email)
        return
      }
      router.replace('/onboarding')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Sign-up failed')
    } finally {
      setBusy(false)
    }
  }

  if (confirmationSent) {
    return (
      <div className="rounded-lg border border-[#e0e0e0] bg-[#fafafa] p-5 text-sm">
        <p className="mb-1 font-semibold text-[#1a1a1a]">Check your email</p>
        <p className="text-[#666666]">
          We sent a confirmation link to <span className="font-mono">{confirmationSent}</span>.
          Click it to finish creating your account.
        </p>
      </div>
    )
  }

  const inputClass = 'h-11 rounded-lg border-[#e0e0e0] px-3.5 text-sm placeholder:text-[#999999]'
  const labelClass = 'text-[13px] font-medium text-[#1a1a1a]'

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-3.5">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem className="gap-1.5">
              <FormLabel className={labelClass}>Full name</FormLabel>
              <FormControl>
                <Input
                  autoComplete="name"
                  placeholder="Nguyen Minh Tuan"
                  disabled={busy}
                  className={inputClass}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="gap-1.5">
              <FormLabel className={labelClass}>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  autoComplete="email"
                  placeholder="driver@example.com"
                  disabled={busy}
                  className={inputClass}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem className="gap-1.5">
              <FormLabel className={labelClass}>Phone number</FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  autoComplete="tel"
                  placeholder="+84 90 123 4567"
                  disabled={busy}
                  className={inputClass}
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
              <FormLabel className={labelClass}>Password</FormLabel>
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
        <FormField
          control={form.control}
          name="terms"
          render={({ field }) => (
            <FormItem className="gap-1">
              <label className="flex items-center gap-2 text-[13px] text-[#666666]">
                <input
                  type="checkbox"
                  className="text-primary focus:ring-primary size-4 rounded border-[#cccccc]"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  disabled={busy}
                />
                I agree to vehicle verification and decal compliance review
              </label>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="bg-primary hover:bg-primary/90 h-12 w-full rounded-[10px] text-base font-semibold"
          disabled={busy}
        >
          {busy ? 'Creating account…' : 'Create Auth Account'}
        </Button>
      </form>
    </Form>
  )
}
