'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { getCurrentUserRole } from '@/lib/auth/role-gate'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

const ReviewSchema = z
  .object({
    driverId: z.string().uuid(),
    decision: z.enum(['approved', 'rejected']),
    reason: z.string().max(500).optional(),
  })
  .refine((d) => d.decision !== 'rejected' || (d.reason && d.reason.trim().length > 0), {
    message: 'Rejection reason required',
    path: ['reason'],
  })

export async function reviewDriverKyc(raw: unknown): Promise<{ error: string | null }> {
  const parsed = ReviewSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  const { driverId, decision, reason } = parsed.data

  // In-action role check — layout guard does not run on direct action POST
  const role = await getCurrentUserRole()
  if (role !== 'admin') return { error: 'Forbidden' }

  const supabase = createSupabaseAdminClient()
  const { error } = await supabase.rpc('approve_driver_kyc', {
    p_driver_id: driverId,
    p_decision: decision,
    p_reason: reason,
  })
  if (error) return { error: error.message }

  revalidatePath('/admin/drivers-kyc')
  return { error: null }
}
