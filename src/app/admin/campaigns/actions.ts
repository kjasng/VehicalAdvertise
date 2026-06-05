'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { getCurrentUserRole } from '@/lib/auth/role-gate'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const CampaignFundingSchema = z
  .object({
    campaignId: z.string().uuid(),
    fundingMode: z.enum(['monthly_cap', 'balance_percent']),
    monthlyBudgetVnd: z.number().int().min(0).max(999_999_999_999).nullable(),
    balancePercent: z.number().min(0).max(100).nullable(),
    driverNetMonthlyVnd: z.number().int().min(1_000_000).max(1_200_000),
    platformFeePct: z.number().min(0).max(80),
    activeDriverLimit: z.number().int().positive().max(100_000).nullable(),
  })
  .refine((value) => value.fundingMode !== 'monthly_cap' || (value.monthlyBudgetVnd ?? 0) > 0, {
    message: 'Monthly cap must be greater than 0.',
  })
  .refine((value) => value.fundingMode !== 'balance_percent' || (value.balancePercent ?? 0) > 0, {
    message: 'Balance percent must be greater than 0.',
  })

export async function updateCampaignFunding(raw: unknown): Promise<{ error: string | null }> {
  const parsed = CampaignFundingSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }

  const role = await getCurrentUserRole()
  if (role !== 'admin') return { error: 'Forbidden' }

  const serverClient = await createSupabaseServerClient()
  const {
    data: { user },
  } = await serverClient.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const data = parsed.data
  const supabase = createSupabaseAdminClient()
  const { error } = await supabase
    .from('campaigns')
    .update({
      funding_mode: data.fundingMode,
      monthly_budget_vnd: data.fundingMode === 'monthly_cap' ? data.monthlyBudgetVnd : null,
      balance_percent: data.fundingMode === 'balance_percent' ? data.balancePercent : null,
      driver_net_monthly_vnd: data.driverNetMonthlyVnd,
      platform_fee_pct: data.platformFeePct,
      active_driver_limit: data.activeDriverLimit,
    })
    .eq('id', data.campaignId)

  if (error) return { error: error.message }

  const { error: auditError } = await supabase.from('audit_log').insert({
    actor_id: user.id,
    action: 'campaign_funding_updated',
    entity_type: 'campaigns',
    entity_id: data.campaignId,
    diff: data,
  })
  if (auditError) console.error('[updateCampaignFunding] audit insert failed:', auditError.message)

  revalidatePath('/admin/campaigns')
  revalidatePath('/admin/contracts')
  revalidatePath(`/admin/contracts/${data.campaignId}`)
  revalidatePath('/driver/invoice')
  return { error: null }
}
