import 'server-only'

import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { GARAGE_INSTALL_FEE_VND, PARTNER_PLATFORM_FEE_PCT } from '@/lib/partner/constants'

export type PricingSettings = {
  id: string | null
  effectiveFrom: string
  platformFeePct: number
  installFeeVnd: number
  garageMinimumWithdrawalVnd: number
  partnerMinimumCapVnd: number
  createdAt: string | null
}

type PricingRuleRow = Partial<{
  id: string
  effective_from: string
  platform_fee_pct: number
  install_fee_vnd: number
  garage_minimum_withdrawal_vnd: number
  partner_minimum_cap_vnd: number
  created_at: string
}>

const DEFAULT_SETTINGS: PricingSettings = {
  id: null,
  effectiveFrom: new Date().toISOString().slice(0, 10),
  platformFeePct: PARTNER_PLATFORM_FEE_PCT,
  installFeeVnd: GARAGE_INSTALL_FEE_VND,
  garageMinimumWithdrawalVnd: 100_000,
  partnerMinimumCapVnd: 0,
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
    platformFeePct: data.platform_fee_pct ?? DEFAULT_SETTINGS.platformFeePct,
    installFeeVnd: GARAGE_INSTALL_FEE_VND,
    garageMinimumWithdrawalVnd:
      data.garage_minimum_withdrawal_vnd ?? DEFAULT_SETTINGS.garageMinimumWithdrawalVnd,
    partnerMinimumCapVnd: data.partner_minimum_cap_vnd ?? DEFAULT_SETTINGS.partnerMinimumCapVnd,
    createdAt: data.created_at ?? null,
  }
}
