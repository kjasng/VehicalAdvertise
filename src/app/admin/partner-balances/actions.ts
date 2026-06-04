'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { getCurrentUserRole } from '@/lib/auth/role-gate'
import { sendPartnerDepositSuccess } from '@/lib/email/send-notifications'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const TopUpSchema = z.object({
  partnerId: z.string().uuid(),
  amountVnd: z.number().int().positive('Amount must be positive').max(999_999_999_999),
  note: z.string().trim().max(200).optional(),
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
  const topUpNote = note || 'Manual top-up by admin'

  const { error: topUpErr } = await supabase.rpc('admin_create_money_ledger_entry', {
    p_actor_id: user.id,
    p_target_type: 'partner',
    p_target_id: partnerId,
    p_kind: 'partner_topup',
    p_amount_vnd: amountVnd,
    p_note: topUpNote,
    p_ref_type: 'manual_topup',
  })
  if (topUpErr) return { error: topUpErr.message }

  const [{ data: partnerProfile }, { data: partnerBalance }] = await Promise.all([
    supabase.from('profiles').select('email, full_name').eq('id', partnerId).maybeSingle(),
    supabase.from('partners').select('balance_vnd').eq('id', partnerId).maybeSingle(),
  ])
  if (partnerProfile?.email) {
    sendPartnerDepositSuccess({
      email: partnerProfile.email,
      name: partnerProfile.full_name,
      amountVnd,
      currentBalanceVnd: partnerBalance?.balance_vnd ?? amountVnd,
    }).catch(() => {})
  }

  revalidatePath('/admin/partner-balances')
  revalidatePath('/admin/dashboard')
  revalidatePath('/admin/invoices/partner')
  revalidatePath('/partner/billing')
  revalidatePath('/partner/dashboard')
  revalidatePath('/admin/audit-log')
  return { error: null }
}
