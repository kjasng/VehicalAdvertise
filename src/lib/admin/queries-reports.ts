import 'server-only'

import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export type WeeklyKmPoint = { week: string; km: number }

export type FinanceMetricKey =
  | 'driverPaidVnd'
  | 'partnerReceivedVnd'
  | 'garagePaidVnd'
  | 'netProfitVnd'

export type MonthlyFinancePoint = Record<FinanceMetricKey, number> & {
  month: string
}

export type ReportsSummary = {
  selectedMonth: string
  periodStart: string
  periodEnd: string
  monthOptions: string[]
  totals: MonthlyFinancePoint
  monthlyFinance: MonthlyFinancePoint[]
}

export function currentMonthString() {
  return new Date().toISOString().slice(0, 7)
}

export function monthRange(month: string): [string, string] {
  const [year, monthNumber] = month.split('-').map(Number)
  const start = new Date(Date.UTC(year, monthNumber - 1, 1))
  const end = new Date(Date.UTC(year, monthNumber, 0))
  return [start.toISOString().slice(0, 10), end.toISOString().slice(0, 10)]
}

export function nextMonthStart(month: string) {
  const [year, monthNumber] = month.split('-').map(Number)
  return new Date(Date.UTC(year, monthNumber, 1)).toISOString().slice(0, 10)
}

export async function getReportsData(month = currentMonthString()): Promise<ReportsSummary> {
  const selectedMonth = /^\d{4}-\d{2}$/.test(month) ? month : currentMonthString()
  const monthOptions = withSelectedMonth(lastMonths(12), selectedMonth)
  const sortedMonths = [...monthOptions].sort((a, b) => b.localeCompare(a))
  const queryStart = sortedMonths[sortedMonths.length - 1] ?? selectedMonth
  const queryEnd = nextMonthStart(sortedMonths[0] ?? selectedMonth)
  const [periodStart, periodEnd] = monthRange(selectedMonth)
  const supabase = createSupabaseAdminClient()

  const [driverInvoices, partnerCharges, garageWithdrawals] = await Promise.all([
    supabase
      .from('driver_invoices')
      .select('amount_vnd, paid_at')
      .eq('status', 'paid')
      .gte('paid_at', `${queryStart}-01`)
      .lt('paid_at', queryEnd),
    // Revenue is recognised when the partner pays the platform — i.e. the
    // campaign budget charged from the partner wallet (ledger `partner_charge`),
    // dated by the charge time. Covers reserved (full budget at creation) and
    // legacy per-period charges alike.
    supabase
      .from('ledger_entries')
      .select('amount_vnd, ts')
      .eq('kind', 'partner_charge')
      .gte('ts', `${queryStart}-01`)
      .lt('ts', queryEnd),
    supabase
      .from('garage_withdrawals')
      .select('amount_vnd, paid_at')
      .eq('status', 'paid')
      .gte('paid_at', `${queryStart}-01`)
      .lt('paid_at', queryEnd),
  ])
  assertNoReportError('driver_invoices', driverInvoices.error)
  assertNoReportError('ledger_entries', partnerCharges.error)
  assertNoReportError('garage_withdrawals', garageWithdrawals.error)

  const rows = Object.fromEntries(monthOptions.map((m) => [m, emptyPoint(m)]))
  for (const row of driverInvoices.data ?? []) {
    if (row.paid_at) pointFor(rows, row.paid_at.slice(0, 7)).driverPaidVnd += row.amount_vnd
  }
  for (const row of partnerCharges.data ?? []) {
    if (row.ts) pointFor(rows, row.ts.slice(0, 7)).partnerReceivedVnd += Math.abs(row.amount_vnd)
  }
  for (const row of garageWithdrawals.data ?? []) {
    if (row.paid_at) pointFor(rows, row.paid_at.slice(0, 7)).garagePaidVnd += row.amount_vnd
  }

  const monthlyFinance = sortedMonths.map((m) => finalizePoint(rows[m] ?? emptyPoint(m))).reverse()
  const totals = finalizePoint(rows[selectedMonth] ?? emptyPoint(selectedMonth))

  return {
    selectedMonth,
    periodStart,
    periodEnd,
    monthOptions,
    totals,
    monthlyFinance,
  }
}

function finalizePoint(point: MonthlyFinancePoint): MonthlyFinancePoint {
  return {
    ...point,
    netProfitVnd: point.partnerReceivedVnd - point.driverPaidVnd - point.garagePaidVnd,
  }
}

function emptyPoint(month: string): MonthlyFinancePoint {
  return {
    month,
    driverPaidVnd: 0,
    partnerReceivedVnd: 0,
    garagePaidVnd: 0,
    netProfitVnd: 0,
  }
}

function pointFor(rows: Record<string, MonthlyFinancePoint>, month: string) {
  rows[month] = rows[month] ?? emptyPoint(month)
  return rows[month]
}

function withSelectedMonth(months: string[], selectedMonth: string) {
  return months.includes(selectedMonth) ? months : [selectedMonth, ...months]
}

function assertNoReportError(source: string, error: { message: string } | null) {
  if (!error) return
  console.error(`[getReportsData] ${source} query error:`, error.message)
  throw new Error(`Unable to load report data from ${source}`)
}

function lastMonths(count: number) {
  const result: string[] = []
  const cursor = new Date()
  cursor.setUTCDate(1)
  for (let index = 0; index < count; index++) {
    result.push(cursor.toISOString().slice(0, 7))
    cursor.setUTCMonth(cursor.getUTCMonth() - 1)
  }
  return result
}
