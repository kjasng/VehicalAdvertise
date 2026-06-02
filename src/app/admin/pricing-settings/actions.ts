'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { getCurrentUserRole } from '@/lib/auth/role-gate'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const UpdatePricingSettingsSchema = z.object({
  installFeeVnd: z.number().int().min(0).max(999_999_999),
  partnerMinimumCapVnd: z.number().int().min(0).max(999_999_999_999),
  baseRatePerKmVnd: z.number().int().positive().max(9_999_999),
  evMultiplier: z.number().min(1).max(10),
  platformFeePct: z.number().min(0).max(100),
  minimumDailyKm: z.number().int().min(0).max(999),
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
    .select('daily_cap_km')
    .lte('effective_from', today)
    .order('effective_from', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (latestError) return { error: latestError.message }

  const { error: insertError } = await supabase.from('pricing_rules').insert({
    effective_from: today,
    base_rate_per_km_vnd: parsed.data.baseRatePerKmVnd,
    ev_multiplier: parsed.data.evMultiplier,
    daily_cap_km: latest?.daily_cap_km ?? 150,
    platform_fee_pct: parsed.data.platformFeePct,
    install_fee_vnd: parsed.data.installFeeVnd,
    partner_minimum_cap_vnd: parsed.data.partnerMinimumCapVnd,
    minimum_daily_km: parsed.data.minimumDailyKm,
    created_by: user.id,
  })
  if (insertError) return { error: insertError.message }

  const { error: auditError } = await supabase.from('audit_log').insert({
    actor_id: user.id,
    action: 'pricing_settings_updated',
    entity_type: 'pricing_rules',
    diff: {
      install_fee_vnd: parsed.data.installFeeVnd,
      partner_minimum_cap_vnd: parsed.data.partnerMinimumCapVnd,
      base_rate_per_km_vnd: parsed.data.baseRatePerKmVnd,
      ev_multiplier: parsed.data.evMultiplier,
      platform_fee_pct: parsed.data.platformFeePct,
      minimum_daily_km: parsed.data.minimumDailyKm,
    },
  })
  if (auditError) console.error('[updatePricingSettings] audit insert failed:', auditError.message)

  revalidatePath('/admin/pricing-settings')
  revalidatePath('/admin/install-proofs')
  return { error: null }
}
