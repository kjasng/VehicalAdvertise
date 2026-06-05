import 'server-only'

import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export type WithdrawalRequestRow = {
  id: string
  role: 'driver' | 'garage'
  actorName: string
  email: string | null
  phone: string | null
  bankAccountNumber: string | null
  bankAccountName: string | null
  bankName: string | null
  bankBin: string | null
  amountVnd: number
  status: 'pending' | 'processing' | 'paid' | 'failed'
  createdAt: string
  periodLabel: string
  reference: string
  sourceId: string
  payoutId: string | null
  failureReason: string | null
}

export type WithdrawalRequestRole = WithdrawalRequestRow['role']

export type WithdrawalRequestCounts = {
  driver: number
  garage: number
  total: number
}

export async function getWithdrawalRequests(
  options: { role?: WithdrawalRequestRole } = {},
): Promise<WithdrawalRequestRow[]> {
  const supabase = createSupabaseAdminClient()
  const includeDriver = !options.role || options.role === 'driver'
  const includeGarage = !options.role || options.role === 'garage'
  const [driverRes, garageRes] = await Promise.all([
    includeDriver
      ? supabase
          .from('driver_invoices')
          .select(
            'id, invoice_number, driver_id, amount_vnd, status, period_start, period_end, requested_at, paid_at, reject_reason, payout_id, bank_snapshot',
          )
          .in('status', ['requested', 'reviewing', 'approved'])
          .order('requested_at', { ascending: false })
          .limit(200)
      : Promise.resolve({ data: [] }),
    includeGarage
      ? supabase
          .from('garage_withdrawals')
          .select(
            'id, withdrawal_number, garage_id, amount_vnd, status, bank_snapshot, requested_at, paid_at, failure_reason',
          )
          .in('status', ['pending', 'processing'])
          .order('requested_at', { ascending: false })
          .limit(200)
      : Promise.resolve({ data: [] }),
  ])

  const driverInvoices = driverRes.data ?? []
  const garageWithdrawals = garageRes.data ?? []
  const driverIds = [...new Set(driverInvoices.map((row) => row.driver_id))]
  const garageIds = [...new Set(garageWithdrawals.map((row) => row.garage_id))]
  const [driverProfiles, driverBanks, garageProfiles, garages] = await Promise.all([
    driverIds.length
      ? supabase.from('profiles').select('id, full_name, email, phone_e164').in('id', driverIds)
      : Promise.resolve({ data: [] }),
    driverIds.length
      ? supabase
          .from('drivers')
          .select('id, bank_account_number, bank_account_name, bank_name, bank_bin')
          .in('id', driverIds)
      : Promise.resolve({ data: [] }),
    garageIds.length
      ? supabase.from('profiles').select('id, email, phone_e164').in('id', garageIds)
      : Promise.resolve({ data: [] }),
    garageIds.length
      ? supabase
          .from('garages')
          .select('id, shop_name, bank_account_number, bank_account_name, bank_name, bank_bin')
          .in('id', garageIds)
      : Promise.resolve({ data: [] }),
  ])

  const profileByDriver = Object.fromEntries(
    (driverProfiles.data ?? []).map((row) => [row.id, row]),
  )
  const bankByDriver = Object.fromEntries((driverBanks.data ?? []).map((row) => [row.id, row]))
  const profileByGarage = Object.fromEntries(
    (garageProfiles.data ?? []).map((row) => [row.id, row]),
  )
  const garageById = Object.fromEntries((garages.data ?? []).map((row) => [row.id, row]))

  return [
    ...driverInvoices.map((row) => {
      const profile = profileByDriver[row.driver_id]
      const bank = bankByDriver[row.driver_id]
      const snapshot = (row.bank_snapshot ?? {}) as Record<string, unknown>
      return {
        id: `driver-${row.id}`,
        role: 'driver' as const,
        actorName: profile?.full_name ?? 'Unknown driver',
        email: profile?.email ?? null,
        phone: profile?.phone_e164 ?? null,
        bankAccountNumber: stringValue(snapshot.bankAccountNumber) ?? bank?.bank_account_number,
        bankAccountName: stringValue(snapshot.bankAccountName) ?? bank?.bank_account_name,
        bankName: stringValue(snapshot.bankName) ?? bank?.bank_name,
        bankBin: stringValue(snapshot.bankBin) ?? bank?.bank_bin,
        amountVnd: row.amount_vnd,
        status: normalizeDriverStatus(row.status),
        createdAt: row.requested_at,
        periodLabel: `${row.period_start} → ${row.period_end}`,
        reference: row.invoice_number,
        sourceId: row.id,
        payoutId: row.payout_id,
        failureReason: row.reject_reason,
      }
    }),
    ...garageWithdrawals.map((row) => {
      const profile = profileByGarage[row.garage_id]
      const garage = garageById[row.garage_id]
      const snapshot = (row.bank_snapshot ?? {}) as Record<string, unknown>
      return {
        id: `garage-${row.id}`,
        role: 'garage' as const,
        actorName: garage?.shop_name ?? 'Unknown garage',
        email: profile?.email ?? null,
        phone: profile?.phone_e164 ?? null,
        bankAccountNumber: stringValue(snapshot.bankAccountNumber) ?? garage?.bank_account_number,
        bankAccountName: stringValue(snapshot.bankAccountName) ?? garage?.bank_account_name,
        bankName: stringValue(snapshot.bankName) ?? garage?.bank_name,
        bankBin: stringValue(snapshot.bankBin) ?? garage?.bank_bin,
        amountVnd: row.amount_vnd,
        status: row.status,
        createdAt: row.requested_at,
        periodLabel: `Requested ${row.requested_at.slice(0, 10)}`,
        reference: row.withdrawal_number,
        sourceId: row.id,
        payoutId: null,
        failureReason: row.failure_reason,
      }
    }),
  ].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function getWithdrawalRequestCounts(): Promise<WithdrawalRequestCounts> {
  const supabase = createSupabaseAdminClient()
  const [driverRes, garageRes] = await Promise.all([
    supabase
      .from('driver_invoices')
      .select('id', { count: 'exact', head: true })
      .in('status', ['requested', 'reviewing', 'approved']),
    supabase
      .from('garage_withdrawals')
      .select('id', { count: 'exact', head: true })
      .in('status', ['pending', 'processing']),
  ])

  if (driverRes.error) {
    console.error('[getWithdrawalRequestCounts] driver error:', driverRes.error.message)
  }
  if (garageRes.error) {
    console.error('[getWithdrawalRequestCounts] garage error:', garageRes.error.message)
  }

  const driver = driverRes.count ?? 0
  const garage = garageRes.count ?? 0
  return { driver, garage, total: driver + garage }
}

function normalizeDriverStatus(status: string): WithdrawalRequestRow['status'] {
  if (status === 'paid') return 'paid'
  if (status === 'approved') return 'processing'
  if (status === 'rejected') return 'failed'
  return 'pending'
}

function stringValue(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null
}
