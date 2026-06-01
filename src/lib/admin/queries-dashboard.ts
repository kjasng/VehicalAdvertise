import 'server-only'

import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export type LedgerRow = {
  id: number
  ts: string
  kind: string
  amountVnd: number
  note: string | null
}

export type DashboardStats = {
  totalDrivers: number
  pendingKyc: number
  activePartners: number
  pendingPartners: number
  activeCampaigns: number
  weeklyKmSum: number
  pendingPayouts: number
  recentLedger: LedgerRow[]
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = createSupabaseAdminClient()

  const sevenDaysAgo = new Date(Date.now() - 7 * 86_400_000).toISOString().split('T')[0]

  const [
    driversRes,
    pendingKycRes,
    partnersRes,
    pendingPartnersRes,
    campaignsRes,
    weeklyKmRes,
    pendingPayoutsRes,
    ledgerRes,
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'driver'),
    // Pending KYC = drivers who have submitted photos (pending review) but not yet approved
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('kyc_status', 'pending')
      .eq('role', 'driver'),
    // Active partners = approved only
    supabase.from('partners').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
    // Pending partner reviews
    supabase.from('partners').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('campaigns').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('contract_daily_stats').select('km_valid').gte('day', sevenDaysAgo),
    supabase.from('payouts').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase
      .from('ledger_entries')
      .select('id, ts, kind, amount_vnd, note')
      .order('ts', { ascending: false })
      .limit(5),
  ])

  // Log any query failures — dashboard returns zeros on partial failure so errors
  // would otherwise be invisible in the UI.
  const queryErrors = [
    driversRes.error,
    pendingKycRes.error,
    partnersRes.error,
    pendingPartnersRes.error,
    campaignsRes.error,
    weeklyKmRes.error,
    pendingPayoutsRes.error,
    ledgerRes.error,
  ].filter(Boolean)
  if (queryErrors.length) {
    console.error(
      '[getDashboardStats] query errors:',
      queryErrors.map((e) => e!.message),
    )
  }

  // NOTE: contract_daily_stats is fetched without SUM aggregation; PostgREST
  // default page size (1000) may truncate rows for large datasets. A dedicated
  // aggregate RPC should replace this JS-side sum in a future migration.
  const weeklyKmSum = (weeklyKmRes.data ?? []).reduce(
    (acc, row) => acc + Number(row.km_valid ?? 0),
    0,
  )

  return {
    totalDrivers: driversRes.count ?? 0,
    pendingKyc: pendingKycRes.count ?? 0,
    activePartners: partnersRes.count ?? 0,
    pendingPartners: pendingPartnersRes.count ?? 0,
    activeCampaigns: campaignsRes.count ?? 0,
    weeklyKmSum,
    pendingPayouts: pendingPayoutsRes.count ?? 0,
    recentLedger: (ledgerRes.data ?? []).map((r) => ({
      id: r.id,
      ts: r.ts,
      kind: r.kind,
      amountVnd: r.amount_vnd,
      note: r.note,
    })),
  }
}
