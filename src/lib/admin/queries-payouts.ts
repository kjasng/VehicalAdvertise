import 'server-only'

import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export type DriverBalance = {
  invoiceId: string
  invoiceNumber: string
  driverId: string
  driverName: string
  email: string | null
  phone: string | null
  bankAccountNumber: string | null
  bankAccountName: string | null
  bankBin: string | null
  totalAccrualVnd: number
  totalPaidVnd: number
  netBalanceVnd: number
  requestedAmountVnd: number
  periodStart: string
  periodEnd: string
}

export type PayoutRow = {
  id: string
  driverId: string
  driverName: string
  email: string | null
  phone: string | null
  bankAccountNumber: string | null
  bankAccountName: string | null
  bankBin: string | null
  periodStart: string
  periodEnd: string
  amountVnd: number
  status: 'pending' | 'processing' | 'paid' | 'failed'
  paidAt: string | null
  failureReason: string | null
  createdAt: string
}

export type GarageWithdrawalAdminRow = {
  id: string
  withdrawalNumber: string
  garageId: string
  garageName: string
  email: string | null
  phone: string | null
  bankAccountNumber: string | null
  bankAccountName: string | null
  bankName: string | null
  bankBin: string | null
  amountVnd: number
  status: 'pending' | 'processing' | 'paid' | 'failed'
  requestedAt: string
  paidAt: string | null
  failureReason: string | null
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

  const { data: invoices, error: invoicesError } = await supabase
    .from('driver_invoices')
    .select('id, invoice_number, driver_id, amount_vnd, period_start, period_end, bank_snapshot')
    .in('status', ['requested', 'reviewing'])
    .is('payout_id', null)
    .order('requested_at', { ascending: true })

  if (invoicesError) {
    console.error('[getDriverBalances] invoice query error:', invoicesError.message)
    return []
  }
  if (!invoices?.length) return []

  const requestedDriverIds = [...new Set(invoices.map((invoice) => invoice.driver_id))]

  // Fetch all driver balance-affecting ledger entries.
  const { data: entries, error: entriesError } = await supabase
    .from('ledger_entries')
    .select('driver_id, kind, amount_vnd')
    .in('kind', ['driver_accrual', 'driver_payout', 'adjustment', 'refund'])
    .in('driver_id', requestedDriverIds)

  if (entriesError) {
    console.error('[getDriverBalances] ledger query error:', entriesError.message)
    return []
  }

  // Aggregate per driver in JS (safe for pilot scale)
  const balanceMap = new Map<string, { accrual: number; paid: number }>()
  for (const entry of entries ?? []) {
    const id = entry.driver_id!
    const cur = balanceMap.get(id) ?? { accrual: 0, paid: 0 }
    if (entry.kind === 'driver_payout') cur.paid += entry.amount_vnd
    else cur.accrual += entry.amount_vnd
    balanceMap.set(id, cur)
  }

  const positiveIds = requestedDriverIds.filter((id) => {
    const balance = balanceMap.get(id)
    return balance ? balance.accrual - balance.paid > 0 : false
  })

  if (!positiveIds.length) return []

  // Fetch profiles + drivers for name and bank info
  const [profilesRes, driversRes] = await Promise.all([
    supabase.from('profiles').select('id, full_name, email, phone_e164').in('id', positiveIds),
    supabase
      .from('drivers')
      .select('id, bank_account_number, bank_account_name, bank_bin')
      .in('id', positiveIds),
  ])

  const profileById = Object.fromEntries((profilesRes.data ?? []).map((p) => [p.id, p]))
  const driverById = Object.fromEntries((driversRes.data ?? []).map((d) => [d.id, d]))

  return invoices
    .filter((invoice) => positiveIds.includes(invoice.driver_id))
    .map((invoice) => {
      const { accrual, paid } = balanceMap.get(invoice.driver_id)!
      const profile = profileById[invoice.driver_id]
      const driver = driverById[invoice.driver_id]
      const bankSnapshot = invoice.bank_snapshot as Record<string, unknown>
      return {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoice_number,
        driverId: invoice.driver_id,
        driverName: profile?.full_name ?? 'Unknown',
        email: profile?.email ?? null,
        phone: profile?.phone_e164 ?? null,
        bankAccountNumber:
          stringValue(bankSnapshot.bankAccountNumber) ?? driver?.bank_account_number ?? null,
        bankAccountName:
          stringValue(bankSnapshot.bankAccountName) ?? driver?.bank_account_name ?? null,
        bankBin: stringValue(bankSnapshot.bankBin) ?? driver?.bank_bin ?? null,
        totalAccrualVnd: accrual,
        totalPaidVnd: paid,
        netBalanceVnd: accrual - paid,
        requestedAmountVnd: invoice.amount_vnd,
        periodStart: invoice.period_start,
        periodEnd: invoice.period_end,
      }
    })
    .sort((a, b) => a.periodStart.localeCompare(b.periodStart))
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
  const payoutIds = payouts.map((p) => p.id)
  const [profilesRes, driversRes, invoicesRes] = await Promise.all([
    driverIds.length
      ? supabase.from('profiles').select('id, full_name, email, phone_e164').in('id', driverIds)
      : Promise.resolve({ data: [] }),
    driverIds.length
      ? supabase
          .from('drivers')
          .select('id, bank_account_number, bank_account_name, bank_bin')
          .in('id', driverIds)
      : Promise.resolve({ data: [] }),
    payoutIds.length
      ? supabase
          .from('driver_invoices')
          .select('payout_id, bank_snapshot')
          .in('payout_id', payoutIds)
      : Promise.resolve({ data: [] }),
  ])

  const profileById = Object.fromEntries((profilesRes.data ?? []).map((p) => [p.id, p]))
  const driverById = Object.fromEntries((driversRes.data ?? []).map((d) => [d.id, d]))
  const invoiceByPayoutId = Object.fromEntries(
    (invoicesRes.data ?? [])
      .filter((invoice) => invoice.payout_id)
      .map((invoice) => [invoice.payout_id!, invoice]),
  )

  return payouts.map((p) => {
    const profile = profileById[p.driver_id]
    const driver = driverById[p.driver_id]
    const bankSnapshot = (invoiceByPayoutId[p.id]?.bank_snapshot ?? {}) as Record<string, unknown>
    return {
      id: p.id,
      driverId: p.driver_id,
      driverName: profile?.full_name ?? 'Unknown',
      email: profile?.email ?? null,
      phone: profile?.phone_e164 ?? null,
      bankAccountNumber:
        stringValue(bankSnapshot.bankAccountNumber) ?? driver?.bank_account_number ?? null,
      bankAccountName:
        stringValue(bankSnapshot.bankAccountName) ?? driver?.bank_account_name ?? null,
      bankBin: stringValue(bankSnapshot.bankBin) ?? driver?.bank_bin ?? null,
      periodStart: p.period_start,
      periodEnd: p.period_end,
      amountVnd: p.amount_vnd,
      status: p.status as PayoutRow['status'],
      paidAt: p.paid_at,
      failureReason: p.failure_reason,
      createdAt: p.created_at,
    }
  })
}

/** Garage withdrawal requests for manual admin review and transfer tracking. */
export async function getGarageWithdrawalHistory(): Promise<GarageWithdrawalAdminRow[]> {
  const supabase = createSupabaseAdminClient()
  const { data: withdrawals, error } = await supabase
    .from('garage_withdrawals')
    .select(
      'id, withdrawal_number, garage_id, amount_vnd, status, bank_snapshot, requested_at, paid_at, failure_reason',
    )
    .order('requested_at', { ascending: false })
    .limit(200)

  if (error) {
    console.error('[getGarageWithdrawalHistory] query error:', error.message)
    return []
  }
  if (!withdrawals?.length) return []

  const garageIds = [...new Set(withdrawals.map((row) => row.garage_id))]
  const [garagesRes, profilesRes] = await Promise.all([
    supabase
      .from('garages')
      .select('id, shop_name, bank_account_number, bank_account_name, bank_name, bank_bin')
      .in('id', garageIds),
    supabase.from('profiles').select('id, email, phone_e164').in('id', garageIds),
  ])

  const garageById = Object.fromEntries((garagesRes.data ?? []).map((row) => [row.id, row]))
  const profileById = Object.fromEntries((profilesRes.data ?? []).map((row) => [row.id, row]))

  return withdrawals.map((withdrawal) => {
    const garage = garageById[withdrawal.garage_id]
    const profile = profileById[withdrawal.garage_id]
    const bankSnapshot = withdrawal.bank_snapshot as Record<string, unknown>
    return {
      id: withdrawal.id,
      withdrawalNumber: withdrawal.withdrawal_number,
      garageId: withdrawal.garage_id,
      garageName: garage?.shop_name ?? 'Unknown garage',
      email: profile?.email ?? null,
      phone: profile?.phone_e164 ?? null,
      bankAccountNumber:
        stringValue(bankSnapshot.bankAccountNumber) ?? garage?.bank_account_number ?? null,
      bankAccountName:
        stringValue(bankSnapshot.bankAccountName) ?? garage?.bank_account_name ?? null,
      bankName: stringValue(bankSnapshot.bankName) ?? garage?.bank_name ?? null,
      bankBin: stringValue(bankSnapshot.bankBin) ?? garage?.bank_bin ?? null,
      amountVnd: withdrawal.amount_vnd,
      status: withdrawal.status,
      requestedAt: withdrawal.requested_at,
      paidAt: withdrawal.paid_at,
      failureReason: withdrawal.failure_reason,
    }
  })
}

function stringValue(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null
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
