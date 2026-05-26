'use client'

/**
 * Driver Profile — account + vehicle + payout settings.
 * Desktop: Personal + Payout in 2-column grid at lg; Vehicle full-width below.
 * CTA row (Save + Sign-out) aligned right with flex justify-end gap-3.
 * react-hook-form + zod. Submit is a stub (console.log + sonner toast).
 */
import { zodResolver } from '@hookform/resolvers/zod'
import { LogOut } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { signOutAction } from '@/app/(public)/login/actions'
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
import { ProfileVehiclePhotoInput } from '@/components/driver/profile-vehicle-photo-input'
import { PageHeader } from '@/components/shared/page-header'
import { SectionShell } from '@/components/shared/section-shell'

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^0\d{9}$/, 'Enter a valid Vietnamese phone number (e.g. 0912345678)'),
  payoutBank: z.string().min(2, 'Bank name required'),
  payoutAccount: z.string().min(6, 'Account number required'),
  vehiclePlate: z.string().regex(/^[0-9]{2}[A-Z]-[0-9]{4,5}$/, 'Format: 29A-12345'),
})

type ProfileFormValues = z.infer<typeof profileSchema>

const DEFAULTS: ProfileFormValues = {
  name: 'Nguyễn Văn An',
  phone: '0912345678',
  payoutBank: 'Vietcombank',
  payoutAccount: '1234567890',
  vehiclePlate: '29A-12345',
}

export default function DriverProfilePage() {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: DEFAULTS,
  })

  function onSubmit(values: ProfileFormValues) {
    // Stub: real impl calls server action to update profiles table.
    console.log('[DriverProfile] submit', values)
    toast.success('Profile updated successfully.')
  }

  return (
    <div className="space-y-6">
      <PageHeader kicker="ACCOUNT" title="Profile" />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-6">
          {/* Personal + Payout — side-by-side at lg */}
          <div className="grid gap-6 lg:grid-cols-2">
            <SectionShell title="Personal">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-bold tracking-[2.5px] text-[#666666] uppercase">
                        Full name
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          autoComplete="name"
                          className="h-[48px]"
                          aria-required="true"
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
                    <FormItem>
                      <FormLabel className="text-[11px] font-bold tracking-[2.5px] text-[#666666] uppercase">
                        Phone number
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="tel"
                          inputMode="numeric"
                          autoComplete="tel"
                          className="h-[48px]"
                          aria-required="true"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </SectionShell>

            <SectionShell title="Payout">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="payoutBank"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-bold tracking-[2.5px] text-[#666666] uppercase">
                        Bank name
                      </FormLabel>
                      <FormControl>
                        <Input {...field} className="h-[48px]" aria-required="true" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="payoutAccount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-bold tracking-[2.5px] text-[#666666] uppercase">
                        Account number
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          inputMode="numeric"
                          autoComplete="off"
                          className="h-[48px]"
                          aria-required="true"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </SectionShell>
          </div>

          {/* Vehicle — full width */}
          <SectionShell title="Vehicle">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="vehiclePlate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] font-bold tracking-[2.5px] text-[#666666] uppercase">
                      License plate
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="29A-12345"
                        className="h-[48px] font-mono uppercase"
                        aria-required="true"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <ProfileVehiclePhotoInput />
            </div>
          </SectionShell>

          {/* CTA row — right-aligned */}
          <div className="flex justify-end gap-3 border-t border-[#cbccc9] pt-4">
            <form action={signOutAction}>
              <Button
                type="submit"
                variant="outline"
                className="h-12 gap-2 px-6 text-[13px] font-bold tracking-[1px] text-red-600 uppercase hover:bg-red-50 hover:text-red-700"
                aria-label="Sign out of driver account"
              >
                <LogOut className="size-4" aria-hidden="true" />
                Sign out
              </Button>
            </form>
            <Button
              type="submit"
              className="h-12 px-8 text-[13px] font-bold tracking-[1px] uppercase"
              disabled={form.formState.isSubmitting}
            >
              Save changes
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
