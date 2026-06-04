'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { getCurrentUserRole } from '@/lib/auth/role-gate'
import { getGarageProfile, hasGaragePayoutSettings } from '@/lib/garage/queries-context'
import { buildGarageWithdrawalHtml } from '@/lib/garage/withdrawal-html'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const UpdateGarageProfileSchema = z.object({
  shopName: z.string().trim().min(2).max(120),
  address: z.string().trim().min(2).max(240),
  contactName: z.string().trim().max(120).optional(),
  phone: z.string().trim().max(30).optional(),
  serviceArea: z.string().trim().max(240).optional(),
  googleMapsUrl: z.string().trim().url().or(z.literal('')).optional(),
  workingHours: z.string().trim().max(160).optional(),
  bankAccountName: z.string().trim().max(120).optional(),
  bankAccountNumber: z.string().trim().max(40).optional(),
  bankName: z.string().trim().max(120).optional(),
  bankBranch: z.string().trim().max(120).optional(),
  bankBin: z.string().trim().max(20).optional(),
})

const WithdrawalSchema = z.object({
  amountVnd: z.number().int().positive().max(999_999_999),
})

export async function updateGarageProfile(raw: unknown): Promise<{ error: string | null }> {
  const parsed = UpdateGarageProfileSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }

  const role = await getCurrentUserRole()
  if (role !== 'garage') return { error: 'Forbidden' }

  const userId = await getUserId()
  if (!userId) return { error: 'Not authenticated' }

  const supabase = createSupabaseAdminClient()
  const { error } = await supabase
    .from('garages')
    .update({
      shop_name: parsed.data.shopName,
      address: parsed.data.address,
      contact_name: parsed.data.contactName || null,
      phone: parsed.data.phone || null,
      service_area: parsed.data.serviceArea || null,
      google_maps_url: parsed.data.googleMapsUrl || null,
      working_hours: parsed.data.workingHours || null,
      bank_account_name: parsed.data.bankAccountName || null,
      bank_account_number: parsed.data.bankAccountNumber || null,
      bank_name: parsed.data.bankName || null,
      bank_branch: parsed.data.bankBranch || null,
      bank_bin: parsed.data.bankBin || null,
      bank_verified_at: null,
    })
    .eq('id', userId)

  if (error) return { error: error.message }

  revalidatePath('/garage/payout')
  revalidatePath('/garage/dashboard')
  return { error: null }
}

export async function requestGarageWithdrawal(raw: unknown): Promise<{ error: string | null }> {
  const parsed = WithdrawalSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }

  const role = await getCurrentUserRole()
  if (role !== 'garage') return { error: 'Forbidden' }

  const profile = await getGarageProfile()
  if (!profile) return { error: 'Garage profile not found.' }
  if (!profile.approved) return { error: 'Garage chưa được admin approve.' }
  if (!hasGaragePayoutSettings(profile)) return { error: 'Hoàn tất payout settings trước khi rút.' }

  const now = new Date().toISOString()
  const suffix = crypto.randomUUID().slice(0, 6).toUpperCase()
  const withdrawalNumber = `GAR-${now.slice(0, 10).replaceAll('-', '')}-${profile.id.slice(0, 8).toUpperCase()}-${suffix}`
  const bankSnapshot = {
    bankAccountName: profile.bankAccountName,
    bankAccountNumber: profile.bankAccountNumber,
    bankName: profile.bankName,
    bankBranch: profile.bankBranch,
    bankBin: profile.bankBin,
  }
  const invoiceHtml = buildGarageWithdrawalHtml({
    withdrawalNumber,
    requestedAt: now,
    garageName: profile.shopName,
    garageAddress: profile.address,
    amountVnd: parsed.data.amountVnd,
    bankAccountName: profile.bankAccountName,
    bankAccountNumber: profile.bankAccountNumber,
    bankName: profile.bankName,
    bankBin: profile.bankBin || null,
  })

  const supabase = createSupabaseAdminClient()
  const { error } = await supabase.rpc('request_garage_withdrawal', {
    p_garage_id: profile.id,
    p_withdrawal_number: withdrawalNumber,
    p_amount_vnd: parsed.data.amountVnd,
    p_bank_snapshot: bankSnapshot,
    p_invoice_html: invoiceHtml,
  })
  if (error) return { error: error.message }

  revalidatePath('/garage/payout')
  revalidatePath('/admin/invoices/garage')
  revalidatePath('/admin/audit-log')
  return { error: null }
}

async function getUserId() {
  const serverClient = await createSupabaseServerClient()
  const {
    data: { user },
  } = await serverClient.auth.getUser()
  return user?.id ?? null
}
