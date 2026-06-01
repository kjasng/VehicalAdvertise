'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { sendDriverKycApproved, sendDriverKycRejected } from '@/lib/email/send-notifications'
import { getCurrentUserRole } from '@/lib/auth/role-gate'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'

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

  // RPC must run under the user JWT so auth.uid() works inside the security-definer function.
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.rpc('approve_driver_kyc', {
    p_driver_id: driverId,
    p_decision: decision,
    p_reason: reason,
  })
  if (error) return { error: error.message }

  // Fire-and-forget email — never blocks the DB operation
  const adminClient = createSupabaseAdminClient()
  const { data: profile } = await adminClient
    .from('profiles')
    .select('email, full_name')
    .eq('id', driverId)
    .single()

  if (profile?.email) {
    if (decision === 'approved') {
      sendDriverKycApproved({ email: profile.email, name: profile.full_name }).catch(() => {})
    } else {
      sendDriverKycRejected({ email: profile.email, name: profile.full_name, reason }).catch(
        () => {},
      )
    }
  }

  revalidatePath('/admin/drivers-kyc')
  return { error: null }
}
