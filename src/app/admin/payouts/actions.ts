'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { getCurrentUserRole } from '@/lib/auth/role-gate'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const CreatePayoutSchema = z.object({
  driverId: z.string().uuid(),
  amountVnd: z.number().int().positive(),
  periodStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  periodEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

const MarkPaidSchema = z.object({
  payoutId: z.string().uuid(),
})

async function getActorId(): Promise<string | null> {
  const serverClient = await createSupabaseServerClient()
  const { data } = await serverClient.auth.getUser()
  return data.user?.id ?? null
}

/** Creates a new payout record and matching ledger_entry. */
export async function createPayout(raw: unknown): Promise<{ error: string | null }> {
  const parsed = CreatePayoutSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  const { driverId, amountVnd, periodStart, periodEnd } = parsed.data

  const role = await getCurrentUserRole()
  if (role !== 'admin') return { error: 'Forbidden' }

  const actorId = await getActorId()
  if (!actorId) return { error: 'Not authenticated' }

  const supabase = createSupabaseAdminClient()

  // Insert payout record
  const { data: payout, error: payoutError } = await supabase
    .from('payouts')
    .insert({
      driver_id: driverId,
      amount_vnd: amountVnd,
      period_start: periodStart,
      period_end: periodEnd,
      status: 'pending',
    })
    .select('id')
    .single()

  if (payoutError) return { error: payoutError.message }

  // Record as ledger debit so net balance reflects this payout
  const { error: ledgerError } = await supabase
    .from('ledger_entries')
    .insert({
      driver_id: driverId,
      kind: 'driver_payout',
      amount_vnd: amountVnd,
      note: `Payout ${payout.id} — ${periodStart} to ${periodEnd}`,
    })

  if (ledgerError) console.error('[createPayout] ledger insert failed:', ledgerError.message)

  const { error: auditError } = await supabase.from('audit_log').insert({
    actor_id: actorId,
    action: 'payout_created',
    entity_type: 'payouts',
    entity_id: payout.id,
    diff: { driverId, amountVnd, periodStart, periodEnd },
  })
  if (auditError) console.error('[createPayout] audit_log insert failed:', auditError.message)

  revalidatePath('/admin/payouts')
  revalidatePath('/admin/dashboard')
  return { error: null }
}

/** Marks an existing pending payout as paid. */
export async function markPayoutPaid(raw: unknown): Promise<{ error: string | null }> {
  const parsed = MarkPaidSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  const { payoutId } = parsed.data

  const role = await getCurrentUserRole()
  if (role !== 'admin') return { error: 'Forbidden' }

  const actorId = await getActorId()
  if (!actorId) return { error: 'Not authenticated' }

  const supabase = createSupabaseAdminClient()

  const { data: updated, error: updateError } = await supabase
    .from('payouts')
    .update({ status: 'paid', paid_at: new Date().toISOString() })
    .eq('id', payoutId)
    .in('status', ['pending', 'processing']) // only allow transitioning from non-terminal states
    .select('id')

  if (updateError) return { error: updateError.message }
  if (!updated?.length) return { error: 'Payout already finalised or not found' }

  const { error: auditError } = await supabase.from('audit_log').insert({
    actor_id: actorId,
    action: 'payout_marked_paid',
    entity_type: 'payouts',
    entity_id: payoutId,
    diff: {},
  })
  if (auditError) console.error('[markPayoutPaid] audit_log insert failed:', auditError.message)

  revalidatePath('/admin/payouts')
  revalidatePath('/admin/dashboard')
  return { error: null }
}
