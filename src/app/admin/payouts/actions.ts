'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { getCurrentUserRole } from '@/lib/auth/role-gate'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const CreatePayoutSchema = z.object({
  invoiceId: z.string().uuid(),
})

const MarkPaidSchema = z.object({
  payoutId: z.string().uuid(),
})

const ReviewGarageWithdrawalSchema = z
  .object({
    withdrawalId: z.string().uuid(),
    decision: z.enum(['approved', 'paid', 'failed']),
    reason: z.string().trim().max(500).optional(),
  })
  .refine((data) => data.decision !== 'failed' || Boolean(data.reason), {
    message: 'Failure reason required',
    path: ['reason'],
  })

async function getActorId(): Promise<string | null> {
  const serverClient = await createSupabaseServerClient()
  const { data } = await serverClient.auth.getUser()
  return data.user?.id ?? null
}

/** Approves a driver withdrawal invoice and reserves it for manual transfer. */
export async function createPayout(raw: unknown): Promise<{ error: string | null }> {
  const parsed = CreatePayoutSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }

  const role = await getCurrentUserRole()
  if (role !== 'admin') return { error: 'Forbidden' }

  const actorId = await getActorId()
  if (!actorId) return { error: 'Not authenticated' }

  const supabase = createSupabaseAdminClient()
  const { error } = await supabase.rpc('admin_approve_driver_withdrawal', {
    p_actor_id: actorId,
    p_invoice_id: parsed.data.invoiceId,
  })
  if (error) return { error: error.message }

  revalidatePath('/admin/payouts')
  revalidatePath('/admin/invoices/driver')
  revalidatePath('/driver/invoice')
  revalidatePath('/admin/dashboard')
  return { error: null }
}

/** Marks a manually transferred driver payout as paid. */
export async function markPayoutPaid(raw: unknown): Promise<{ error: string | null }> {
  const parsed = MarkPaidSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  const { payoutId } = parsed.data

  const role = await getCurrentUserRole()
  if (role !== 'admin') return { error: 'Forbidden' }

  const actorId = await getActorId()
  if (!actorId) return { error: 'Not authenticated' }

  const supabase = createSupabaseAdminClient()
  const { error } = await supabase.rpc('admin_mark_driver_payout_paid', {
    p_actor_id: actorId,
    p_payout_id: payoutId,
  })
  if (error) return { error: error.message }

  revalidatePath('/admin/payouts')
  revalidatePath('/admin/invoices/driver')
  revalidatePath('/driver/invoice')
  revalidatePath('/admin/dashboard')
  return { error: null }
}

export async function reviewGarageWithdrawal(raw: unknown): Promise<{ error: string | null }> {
  const parsed = ReviewGarageWithdrawalSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }

  const role = await getCurrentUserRole()
  if (role !== 'admin') return { error: 'Forbidden' }

  const actorId = await getActorId()
  if (!actorId) return { error: 'Not authenticated' }

  const supabase = createSupabaseAdminClient()
  const { error } = await supabase.rpc('admin_review_garage_withdrawal', {
    p_actor_id: actorId,
    p_withdrawal_id: parsed.data.withdrawalId,
    p_decision: parsed.data.decision,
    p_reason: parsed.data.reason ?? null,
  })
  if (error) return { error: error.message }

  revalidatePath('/admin/payouts')
  revalidatePath('/admin/invoices/garage')
  revalidatePath('/garage/payout')
  revalidatePath('/admin/audit-log')
  return { error: null }
}
