'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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

const phoneSchema = z.object({
  phone: z.string().regex(/^\+?[1-9]\d{7,14}$/, 'Use E.164 format, e.g. +84912345678'),
})

const otpSchema = z.object({
  token: z.string().regex(/^\d{6}$/, '6-digit code'),
})

type Step = 'phone' | 'otp'

export function LoginForm() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState<string>('')

  const phoneForm = useForm<z.infer<typeof phoneSchema>>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: '+84' },
  })

  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: { token: '' },
  })

  const submitPhone = phoneForm.handleSubmit(async ({ phone: p }) => {
    const supabase = createSupabaseBrowserClient()
    const { error } = await supabase.auth.signInWithOtp({ phone: p })
    if (error) {
      toast.error(error.message)
      return
    }
    setPhone(p)
    setStep('otp')
    toast.success('OTP sent. Check your SMS.')
  })

  const submitOtp = otpForm.handleSubmit(async ({ token }) => {
    const supabase = createSupabaseBrowserClient()
    const { error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms',
    })
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success('Signed in')
    router.replace('/')
    router.refresh()
  })

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Wheels Earner</CardTitle>
        <CardDescription>
          {step === 'phone'
            ? 'Sign in with your Vietnamese phone number.'
            : `Enter the 6-digit code sent to ${phone}.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === 'phone' ? (
          <Form {...phoneForm}>
            <form onSubmit={submitPhone} className="space-y-4">
              <FormField
                control={phoneForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone number</FormLabel>
                    <FormControl>
                      <Input {...field} type="tel" autoComplete="tel" placeholder="+84912345678" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={phoneForm.formState.isSubmitting}>
                {phoneForm.formState.isSubmitting ? 'Sending…' : 'Send OTP'}
              </Button>
            </form>
          </Form>
        ) : (
          <Form {...otpForm}>
            <form onSubmit={submitOtp} className="space-y-4">
              <FormField
                control={otpForm.control}
                name="token"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>One-time code</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        placeholder="123456"
                        maxLength={6}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={otpForm.formState.isSubmitting}>
                {otpForm.formState.isSubmitting ? 'Verifying…' : 'Verify & sign in'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setStep('phone')}
              >
                Use different number
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  )
}
