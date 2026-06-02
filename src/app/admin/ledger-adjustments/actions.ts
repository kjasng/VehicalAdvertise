'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { getCurrentUserRole } from '@/lib/auth/role-gate'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const AdjustmentSchema = z.object({
  targetType: z.enum(['partner', 'driver']),
  targetId: z.string().uuid(),
  kind: z.enum(['adjustment', 'refund']),
  direction: z.enum(['credit', 'debit']),
  amountVnd: z.number().int().positive('Amount must be positive').max(999_999_999_999),
  note: z.string().trim().min(5, 'Reason is required (min 5 characters)').max(300),
})

const MONEY_PATHS = [
  '/admin/ledger-adjustments',
  '/admin/dashboard',
  '/admin/payouts',
  '/admin/partner-balances',
  '/admin/invoices/driver',
  '/admin/invoices/partner',
  '/admin/audit-log',
]

/**
 * Creates an adjustment/refund ledger entry for SePay disputes or corrections.
 * - credit  = +amount (money added)
 * - debit   = -amount (money removed)
 * For partner targets, partners.balance_vnd is updated to keep the wallet in sync.
 * Driver balances are derived from the ledger, so no column update is needed.
 */
export async function createLedgerAdjustment(raw: unknown): Promise<{ error: string | null }> {
  const parsed = AdjustmentSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  const { targetType, targetId, kind, direction, amountVnd, note } = parsed.data

  const role = await getCurrentUserRole()
  if (role !== 'admin') return { error: 'Forbidden' }

  const sc = await createSupabaseServerClient()
  const {
    data: { user },
  } = await sc.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const supabase = createSupabaseAdminClient()
  const signedAmount = direction === 'debit' ? -amountVnd : amountVnd

  if (targetType === 'partner') {
    const { data: partner, error: partnerErr } = await supabase
      .from('partners')
      .select('id, balance_vnd')
      .eq('id', targetId)
      .maybeSingle()
    if (partnerErr) return { error: partnerErr.message }
    if (!partner) return { error: 'Partner not found' }

    if (partner.balance_vnd + signedAmount < 0) {
      return {
        error: `Số dư không đủ (hiện tại ${(partner?.balance_vnd ?? 0).toLocaleString('vi-VN')} ₫)`,
      }
    }
  } else {
    const { data: driver, error: driverErr } = await supabase
      .from('drivers')
      .select('id')
      .eq('id', targetId)
      .maybeSingle()
    if (driverErr) return { error: driverErr.message }
    if (!driver) return { error: 'Driver not found' }
  }

  const { error: ledgerErr } = await supabase.rpc('admin_create_money_ledger_entry', {
    p_actor_id: user.id,
    p_target_type: targetType,
    p_target_id: targetId,
    p_kind: kind,
    p_amount_vnd: signedAmount,
    p_note: note,
    p_ref_type: 'manual_adjustment',
  })
  if (ledgerErr) {
    if (ledgerErr.message.includes('partner balance cannot go negative')) {
      return {
        error: 'Số dư không đủ. Refresh và thử lại.',
      }
    }
    return { error: ledgerErr.message }
  }

  for (const path of MONEY_PATHS) revalidatePath(path)
  return { error: null }
}
