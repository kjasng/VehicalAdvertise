'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { getCurrentUserRole } from '@/lib/auth/role-gate'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const TopUpSchema = z.object({
  partnerId: z.string().uuid(),
  amountVnd: z.number().int().positive('Amount must be positive'),
  note: z.string().max(200).optional(),
})

export async function topUpPartnerBalance(raw: unknown): Promise<{ error: string | null }> {
  const parsed = TopUpSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  const { partnerId, amountVnd, note } = parsed.data

  const role = await getCurrentUserRole()
  if (role !== 'admin') return { error: 'Forbidden' }

  const sc = await createSupabaseServerClient()
  const {
    data: { user },
  } = await sc.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const supabase = createSupabaseAdminClient()

  // Insert ledger entry
  const { error: ledgerErr } = await supabase.from('ledger_entries').insert({
    partner_id: partnerId,
    kind: 'partner_topup',
    amount_vnd: amountVnd,
    note: note ?? `Manual top-up by admin`,
  })
  if (ledgerErr) return { error: ledgerErr.message }

  // Update partner balance
  const { data: current } = await supabase
    .from('partners')
    .select('balance_vnd')
    .eq('id', partnerId)
    .single()

  const { error: balanceErr } = await supabase
    .from('partners')
    .update({ balance_vnd: (current?.balance_vnd ?? 0) + amountVnd })
    .eq('id', partnerId)
  if (balanceErr) return { error: balanceErr.message }

  await supabase.from('audit_log').insert({
    actor_id: user.id,
    action: 'partner_topup',
    entity_type: 'partners',
    entity_id: partnerId,
    diff: { amount_vnd: amountVnd, note: note ?? null },
  })

  revalidatePath('/admin/partner-balances')
  return { error: null }
}
