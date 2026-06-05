import 'server-only'

import { getPricingSettings } from '@/lib/admin/queries-pricing-settings'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

import { getGarageProfile } from './queries-context'
import type { GaragePayoutData, GarageWithdrawalRow } from './types'

export async function getGaragePayoutData(): Promise<GaragePayoutData | null> {
  const profile = await getGarageProfile()
  if (!profile) return null

  const supabase = createSupabaseAdminClient()
  const [pricing, withdrawalsRes] = await Promise.all([
    getPricingSettings(),
    supabase
      .from('garage_withdrawals')
      .select('id, withdrawal_number, amount_vnd, status, requested_at, paid_at, failure_reason')
      .eq('garage_id', profile.id)
      .order('requested_at', { ascending: false })
      .limit(100),
  ])

  const withdrawals: GarageWithdrawalRow[] = (withdrawalsRes.data ?? []).map((row) => ({
    id: row.id,
    withdrawalNumber: row.withdrawal_number,
    amountVnd: row.amount_vnd,
    status: row.status,
    requestedAt: row.requested_at,
    paidAt: row.paid_at,
    failureReason: row.failure_reason,
  }))

  return {
    profile,
    minimumWithdrawalVnd: pricing.garageMinimumWithdrawalVnd,
    withdrawals,
  }
}
