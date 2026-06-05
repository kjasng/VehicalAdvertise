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
  const { data: latest, error: latestError } = await supabase
    .from('pricing_rules')
    .select('base_rate_per_km_vnd, ev_multiplier, daily_cap_km, minimum_daily_km')
    .lte('effective_from', today)
    .order('effective_from', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (latestError) return { error: latestError.message }

  const { error: insertError } = await supabase.from('pricing_rules').insert({
    effective_from: today,
    base_rate_per_km_vnd: latest?.base_rate_per_km_vnd ?? 1500,
    ev_multiplier: latest?.ev_multiplier ?? 1.3,
    daily_cap_km: latest?.daily_cap_km ?? 150,
    platform_fee_pct: parsed.data.platformFeePct,
    install_fee_vnd: GARAGE_INSTALL_FEE_VND,
    garage_minimum_withdrawal_vnd: parsed.data.garageMinimumWithdrawalVnd,
    partner_minimum_cap_vnd: parsed.data.partnerMinimumCapVnd,
    minimum_daily_km: latest?.minimum_daily_km ?? 0,
    created_by: user.id,
  })
  if (insertError) return { error: insertError.message }

  const { error: auditError } = await supabase.from('audit_log').insert({
    actor_id: user.id,
    action: 'pricing_settings_updated',
    entity_type: 'pricing_rules',
    diff: {
      install_fee_vnd: GARAGE_INSTALL_FEE_VND,
      garage_minimum_withdrawal_vnd: parsed.data.garageMinimumWithdrawalVnd,
      partner_minimum_cap_vnd: parsed.data.partnerMinimumCapVnd,
      platform_fee_pct: parsed.data.platformFeePct,
    },
  })
  if (auditError) console.error('[updatePricingSettings] audit insert failed:', auditError.message)

  revalidatePath('/admin/pricing-settings')
  revalidatePath('/admin/install-proofs')
  revalidatePath('/garage/payout')
  return { error: null }
}
