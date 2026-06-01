import 'server-only'

import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export type DriverBalance = {
  driverId: string
  driverName: string
  bankAccountNumber: string | null
  bankAccountName: string | null
  bankBin: string | null
  totalAccrualVnd: number
  totalPaidVnd: number
  netBalanceVnd: number
}

export type PayoutRow = {
  id: string
  driverId: string
  driverName: string
  periodStart: string
  periodEnd: string
  amountVnd: number
  status: 'pending' | 'processing' | 'paid' | 'failed'
  paidAt: string | null
  failureReason: string | null
  createdAt: string
}

export type SepayEventRow = {
  id: number
  txnId: string
  receivedAt: string
  processedAt: string | null
  error: string | null
  // partial payload fields surfaced for display
  amount: number | null
  description: string | null
}

/** Computes net accrual balance per driver from ledger_entries. */
export async function getDriverBalances(): Promise<DriverBalance[]> {
  const supabase = createSupabaseAdminClient()

  // Fetch all driver accrual and payout ledger entries
  const { data: entries, error: entriesError } = await supabase
    .from('ledger_entries')
    .select('driver_id, kind, amount_vnd')
    .in('kind', ['driver_accrual', 'driver_payout'])
    .not('driver_id', 'is', null)

  if (entriesError) {
    console.error('[getDriverBalances] ledger query error:', entriesError.message)
    return []
  }

  // Aggregate per driver in JS (safe for pilot scale)
  const balanceMap = new Map<string, { accrual: number; paid: number }>()
  for (const entry of entries ?? []) {
    const id = entry.driver_id!
    const cur = balanceMap.get(id) ?? { accrual: 0, paid: 0 }
    if (entry.kind === 'driver_accrual') cur.accrual += entry.amount_vnd
    else cur.paid += entry.amount_vnd
    balanceMap.set(id, cur)
  }

  // Filter to drivers with a positive balance
  const positiveIds = Array.from(balanceMap.entries())
    .filter(([, v]) => v.accrual - v.paid > 0)
    .map(([id]) => id)

  if (!positiveIds.length) return []

  // Fetch profiles + drivers for name and bank info
  const [profilesRes, driversRes] = await Promise.all([
    supabase.from('profiles').select('id, full_name').in('id', positiveIds),
    supabase
      .from('drivers')
      .select('id, bank_account_number, bank_account_name, bank_bin')
      .in('id', positiveIds),
  ])

  const nameById = Object.fromEntries((profilesRes.data ?? []).map((p) => [p.id, p.full_name]))
  const driverById = Object.fromEntries((driversRes.data ?? []).map((d) => [d.id, d]))

  return positiveIds
    .map((id) => {
      const { accrual, paid } = balanceMap.get(id)!
      const driver = driverById[id]
      return {
        driverId: id,
        driverName: nameById[id] ?? 'Unknown',
        bankAccountNumber: driver?.bank_account_number ?? null,
        bankAccountName: driver?.bank_account_name ?? null,
        bankBin: driver?.bank_bin ?? null,
        totalAccrualVnd: accrual,
        totalPaidVnd: paid,
        netBalanceVnd: accrual - paid,
      }
    })
    .sort((a, b) => b.netBalanceVnd - a.netBalanceVnd)
}

/** Fetches payout history ordered by newest first. */
export async function getPayoutHistory(): Promise<PayoutRow[]> {
  const supabase = createSupabaseAdminClient()

  const { data: payouts, error } = await supabase
    .from('payouts')
    .select(
      'id, driver_id, period_start, period_end, amount_vnd, status, paid_at, failure_reason, created_at',
    )
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) {
    console.error('[getPayoutHistory] payouts query error:', error.message)
    return []
  }
  if (!payouts?.length) return []

  const driverIds = [...new Set(payouts.map((p) => p.driver_id))]
  const { data: profiles } = driverIds.length
    ? await supabase.from('profiles').select('id, full_name').in('id', driverIds)
    : { data: [] }

  const nameById = Object.fromEntries((profiles ?? []).map((p) => [p.id, p.full_name]))

  return payouts.map((p) => ({
    id: p.id,
    driverId: p.driver_id,
    driverName: nameById[p.driver_id] ?? 'Unknown',
    periodStart: p.period_start,
    periodEnd: p.period_end,
    amountVnd: p.amount_vnd,
    status: p.status as PayoutRow['status'],
    paidAt: p.paid_at,
    failureReason: p.failure_reason,
    createdAt: p.created_at,
  }))
}

/** Fetches the 50 most recent SePay webhook events. */
export async function getSepayEvents(): Promise<SepayEventRow[]> {
  const supabase = createSupabaseAdminClient()

  const { data, error } = await supabase
    .from('sepay_webhook_events')
    .select('id, txn_id, received_at, processed_at, error, payload')
    .order('received_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('[getSepayEvents] query error:', error.message)
    return []
  }

  return (data ?? []).map((e) => {
    const payload = (e.payload ?? {}) as Record<string, unknown>
    return {
      id: e.id,
      txnId: e.txn_id,
      receivedAt: e.received_at,
      processedAt: e.processed_at,
      error: e.error,
      amount: typeof payload.amount === 'number' ? payload.amount : null,
      description: typeof payload.description === 'string' ? payload.description : null,
    }
  })
}
