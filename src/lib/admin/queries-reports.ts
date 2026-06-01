import 'server-only'

import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export type WeeklyKmPoint = { week: string; km: number }

export type ReportPeriod = 'week' | 'month' | 'prev_month' | 'year'

export type ReportsSummary = {
  weeklyKm: WeeklyKmPoint[]
  totalDrivers: number
  totalPartners: number
  totalKmPeriod: number
  periodStart: string
  periodEnd: string
}

/** Returns [startDate, endDate] in YYYY-MM-DD for a given period. */
function periodRange(period: ReportPeriod): [string, string] {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth() // 0-indexed

  if (period === 'week') {
    const start = new Date(now)
    start.setDate(now.getDate() - 6)
    return [start.toISOString().split('T')[0], now.toISOString().split('T')[0]]
  }
  if (period === 'month') {
    const start = new Date(y, m, 1)
    const end = new Date(y, m + 1, 0)
    return [start.toISOString().split('T')[0], end.toISOString().split('T')[0]]
  }
  if (period === 'prev_month') {
    const start = new Date(y, m - 1, 1)
    const end = new Date(y, m, 0)
    return [start.toISOString().split('T')[0], end.toISOString().split('T')[0]]
  }
  // year
  return [`${y}-01-01`, `${y}-12-31`]
}

/** Groups daily stats rows into labelled buckets based on period. */
function groupByPeriod(
  rows: { day: string; km_valid: number | null }[],
  period: ReportPeriod,
): WeeklyKmPoint[] {
  const bucketMap = new Map<string, number>()

  for (const row of rows) {
    const date = new Date(row.day)
    let label: string

    if (period === 'week') {
      // Daily labels: "Mon 6/2"
      label = date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'numeric',
        day: 'numeric',
      })
    } else if (period === 'year') {
      // Monthly labels: "Jan", "Feb"
      label = date.toLocaleDateString('en-US', { month: 'short' })
    } else {
      // week/month/prev_month: group by ISO week within the range
      label = isoWeekLabel(date)
    }

    bucketMap.set(label, (bucketMap.get(label) ?? 0) + Number(row.km_valid ?? 0))
  }

  return Array.from(bucketMap.entries()).map(([week, km]) => ({ week, km: Math.round(km) }))
}

export async function getReportsData(period: ReportPeriod = 'week'): Promise<ReportsSummary> {
  const supabase = createSupabaseAdminClient()
  const [startDate, endDate] = periodRange(period)

  const [statsRes, driverCountRes, partnerCountRes] = await Promise.all([
    supabase
      .from('contract_daily_stats')
      .select('day, km_valid')
      .gte('day', startDate)
      .lte('day', endDate)
      .order('day', { ascending: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'driver'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'partner'),
  ])

  const queryErrors = [statsRes.error, driverCountRes.error, partnerCountRes.error].filter(Boolean)
  if (queryErrors.length) {
    console.error(
      '[getReportsData] query errors:',
      queryErrors.map((e) => e!.message),
    )
  }

  const rows = statsRes.data ?? []
  const weeklyKm = groupByPeriod(rows, period)
  const totalKmPeriod = rows.reduce((acc, r) => acc + Number(r.km_valid ?? 0), 0)

  return {
    weeklyKm,
    totalDrivers: driverCountRes.count ?? 0,
    totalPartners: partnerCountRes.count ?? 0,
    totalKmPeriod: Math.round(totalKmPeriod),
    periodStart: startDate,
    periodEnd: endDate,
  }
}

// Returns 'W{ISO week number}' label for a given date
function isoWeekLabel(date: Date): string {
  const tmp = new Date(date)
  tmp.setHours(0, 0, 0, 0)
  tmp.setDate(tmp.getDate() + 3 - ((tmp.getDay() + 6) % 7))
  const week1 = new Date(tmp.getFullYear(), 0, 4)
  const weekNum =
    1 +
    Math.round(
      ((tmp.getTime() - week1.getTime()) / 86_400_000 - 3 + ((week1.getDay() + 6) % 7)) / 7,
    )
  return `W${weekNum}`
}
