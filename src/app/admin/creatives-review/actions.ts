'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { getCurrentUserRole } from '@/lib/auth/role-gate'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const ReviewSchema = z
  .object({
    campaignId: z.string().uuid(),
    decision: z.enum(['approved', 'rejected']),
    reason: z.string().max(500).optional(),
  })
  .refine((d) => d.decision !== 'rejected' || (d.reason && d.reason.trim().length > 0), {
    message: 'Rejection reason required',
    path: ['reason'],
  })

export async function reviewCampaign(raw: unknown): Promise<{ error: string | null }> {
  const parsed = ReviewSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  const { campaignId, decision, reason } = parsed.data

  const role = await getCurrentUserRole()
  if (role !== 'admin') return { error: 'Forbidden' }

  // RPC must run under the user JWT so auth.uid() works inside the security-definer function.
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.rpc('approve_campaign', {
    p_campaign_id: campaignId,
    p_decision: decision,
    p_reason: reason,
  })
  if (error) return { error: error.message }

  revalidatePath('/admin/creatives-review')
  return { error: null }
}
