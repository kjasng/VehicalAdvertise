import 'server-only'

import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export type WeeklyKmPoint = { week: string; km: number }

export type ReportsSummary = {
  weeklyKm: WeeklyKmPoint[]
  totalDrivers: number
  totalPartners: number
  totalKmAllTime: number
}

export async function getReportsData(): Promise<ReportsSummary> {
  const supabase = createSupabaseAdminClient()

  const twelveWeeksAgo = new Date(Date.now() - 84 * 86_400_000).toISOString().split('T')[0]

  const [statsRes, driverCountRes, partnerCountRes] = await Promise.all([
    supabase
      .from('contract_daily_stats')
      .select('day, km_valid')
      .gte('day', twelveWeeksAgo)
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

  // NOTE: fetching raw rows and summing in JS. PostgREST default page size (1000)
  // may truncate for large datasets — replace with a SUM aggregate RPC when needed.
  const rows = statsRes.data ?? []

  // Group by ISO week number — format as 'W{N}'
  const weekMap = new Map<string, number>()
  for (const row of rows) {
    const date = new Date(row.day)
    const week = isoWeekLabel(date)
    weekMap.set(week, (weekMap.get(week) ?? 0) + Number(row.km_valid ?? 0))
  }

  const weeklyKm: WeeklyKmPoint[] = Array.from(weekMap.entries()).map(([week, km]) => ({
    week,
    km: Math.round(km),
  }))

  const totalKmAllTime = rows.reduce((acc, r) => acc + Number(r.km_valid ?? 0), 0)

  return {
    weeklyKm,
    totalDrivers: driverCountRes.count ?? 0,
    totalPartners: partnerCountRes.count ?? 0,
    totalKmAllTime: Math.round(totalKmAllTime),
  }
}

// Returns 'W{ISO week number}' label for a given date
function isoWeekLabel(date: Date): string {
  const tmp = new Date(date)
  tmp.setHours(0, 0, 0, 0)
  // Thursday of the current week determines the ISO year
  tmp.setDate(tmp.getDate() + 3 - ((tmp.getDay() + 6) % 7))
  const week1 = new Date(tmp.getFullYear(), 0, 4)
  const weekNum =
    1 +
    Math.round(
      ((tmp.getTime() - week1.getTime()) / 86_400_000 - 3 + ((week1.getDay() + 6) % 7)) / 7,
    )
  return `W${weekNum}`
}
