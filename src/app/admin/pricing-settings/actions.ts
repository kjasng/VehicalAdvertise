'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { getCurrentUserRole } from '@/lib/auth/role-gate'
import { GARAGE_INSTALL_FEE_VND } from '@/lib/partner/constants'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const UpdatePricingSettingsSchema = z.object({
  garageMinimumWithdrawalVnd: z.number().int().min(0).max(999_999_999),
  partnerMinimumCapVnd: z.number().int().min(0).max(999_999_999_999),
  platformFeePct: z.number().min(0).max(100),
})

export async function updatePricingSettings(raw: unknown): Promise<{ error: string | null }> {
  const parsed = UpdatePricingSettingsSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }

  const role = await getCurrentUserRole()
  if (role !== 'admin') return { error: 'Forbidden' }

  const serverClient = await createSupabaseServerClient()
  const {
    data: { user },
  } = await serverClient.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const supabase = createSupabaseAdminClient()
  const today = new Date().toISOString().slice(0, 10)

  const { error: insertError } = await supabase.from('pricing_rules').insert({
    effective_from: today,
    platform_fee_pct: parsed.data.platformFeePct,
    install_fee_vnd: GARAGE_INSTALL_FEE_VND,
    garage_minimum_withdrawal_vnd: parsed.data.garageMinimumWithdrawalVnd,
    partner_minimum_cap_vnd: parsed.data.partnerMinimumCapVnd,
  })
  if (insertError) return { error: insertError.message }

  revalidatePath('/admin/pricing-settings')
  revalidatePath('/admin/install-proofs')
  revalidatePath('/garage/payout')
  return { error: null }
}
