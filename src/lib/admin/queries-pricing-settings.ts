import 'server-only'

import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export type PricingSettings = {
  id: string | null
  effectiveFrom: string
  baseRatePerKmVnd: number
  evMultiplier: number
  dailyCapKm: number
  platformFeePct: number
  installFeeVnd: number
  partnerMinimumCapVnd: number
  minimumDailyKm: number
  createdAt: string | null
}

type PricingRuleRow = Partial<{
  id: string
  effective_from: string
  base_rate_per_km_vnd: number
  ev_multiplier: number
  daily_cap_km: number
  platform_fee_pct: number
  install_fee_vnd: number
  partner_minimum_cap_vnd: number
  minimum_daily_km: number
  created_at: string
}>

const DEFAULT_SETTINGS: PricingSettings = {
  id: null,
  effectiveFrom: new Date().toISOString().slice(0, 10),
  baseRatePerKmVnd: 1500,
  evMultiplier: 1.3,
  dailyCapKm: 150,
  platformFeePct: 20,
  installFeeVnd: 0,
  partnerMinimumCapVnd: 0,
  minimumDailyKm: 0,
  createdAt: null,
}

export async function getPricingSettings(): Promise<PricingSettings> {
  const supabase = createSupabaseAdminClient()
  const today = new Date().toISOString().slice(0, 10)
  const { data, error } = await supabase
    .from('pricing_rules')
    .select('*')
    .lte('effective_from', today)
    .order('effective_from', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('[getPricingSettings] query error:', error.message)
    return DEFAULT_SETTINGS
  }
  if (!data) return DEFAULT_SETTINGS

  return rowToSettings(data as unknown as PricingRuleRow)
}

function rowToSettings(data: PricingRuleRow): PricingSettings {
  return {
    id: data.id ?? null,
    effectiveFrom: data.effective_from ?? DEFAULT_SETTINGS.effectiveFrom,
    baseRatePerKmVnd: data.base_rate_per_km_vnd ?? DEFAULT_SETTINGS.baseRatePerKmVnd,
    evMultiplier: data.ev_multiplier ?? DEFAULT_SETTINGS.evMultiplier,
    dailyCapKm: data.daily_cap_km ?? DEFAULT_SETTINGS.dailyCapKm,
    platformFeePct: data.platform_fee_pct ?? DEFAULT_SETTINGS.platformFeePct,
    installFeeVnd: data.install_fee_vnd ?? DEFAULT_SETTINGS.installFeeVnd,
    partnerMinimumCapVnd: data.partner_minimum_cap_vnd ?? DEFAULT_SETTINGS.partnerMinimumCapVnd,
    minimumDailyKm: data.minimum_daily_km ?? DEFAULT_SETTINGS.minimumDailyKm,
    createdAt: data.created_at ?? null,
  }
}
