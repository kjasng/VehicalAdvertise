import 'server-only'

import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export type RecentRequestRow = {
  id: string
  type: 'driver_withdrawal' | 'garage_withdrawal'
  actorName: string
  status: string
  amountVnd: number
  createdAt: string
  href: string
}

export type DashboardStats = {
  totalDrivers: number
  activePartners: number
  activeCampaigns: number
  pendingPayouts: number
  recentRequests: RecentRequestRow[]
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = createSupabaseAdminClient()

  const [
    driversRes,
    partnersRes,
    campaignsRes,
    driverWithdrawalsRes,
    garageWithdrawalsRes,
    recentDriverInvoicesRes,
    recentGarageWithdrawalsRes,
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'driver'),
    // Active partners = approved only
    supabase.from('partners').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('campaigns').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase
      .from('driver_invoices')
      .select('*', { count: 'exact', head: true })
      .in('status', ['requested', 'reviewing', 'approved']),
    supabase
      .from('garage_withdrawals')
      .select('*', { count: 'exact', head: true })
      .in('status', ['pending', 'processing']),
    supabase
      .from('driver_invoices')
      .select('id, invoice_number, driver_id, amount_vnd, status, requested_at')
      .order('requested_at', { ascending: false })
      .limit(5),
    supabase
      .from('garage_withdrawals')
      .select('id, withdrawal_number, garage_id, amount_vnd, status, requested_at')
      .order('requested_at', { ascending: false })
      .limit(5),
  ])

  // Log any query failures — dashboard returns zeros on partial failure so errors
  // would otherwise be invisible in the UI.
  const queryErrors = [
    driversRes.error,
    partnersRes.error,
    campaignsRes.error,
    driverWithdrawalsRes.error,
    garageWithdrawalsRes.error,
    recentDriverInvoicesRes.error,
    recentGarageWithdrawalsRes.error,
  ].filter(Boolean)
  if (queryErrors.length) {
    console.error(
      '[getDashboardStats] query errors:',
      queryErrors.map((e) => e!.message),
    )
  }

  const recentRequests = await hydrateRecentRequests({
    driverInvoices: recentDriverInvoicesRes.data ?? [],
    garageWithdrawals: recentGarageWithdrawalsRes.data ?? [],
  })

  return {
    totalDrivers: driversRes.count ?? 0,
    activePartners: partnersRes.count ?? 0,
    activeCampaigns: campaignsRes.count ?? 0,
    pendingPayouts: (driverWithdrawalsRes.count ?? 0) + (garageWithdrawalsRes.count ?? 0),
    recentRequests,
  }
}

async function hydrateRecentRequests({
  driverInvoices,
  garageWithdrawals,
}: {
  driverInvoices: {
    id: string
    invoice_number: string
    driver_id: string
    amount_vnd: number
    status: string
    requested_at: string
  }[]
  garageWithdrawals: {
    id: string
    withdrawal_number: string
    garage_id: string
    amount_vnd: number
    status: string
    requested_at: string
  }[]
}): Promise<RecentRequestRow[]> {
  const supabase = createSupabaseAdminClient()
  const driverIds = [...new Set(driverInvoices.map((row) => row.driver_id))]
  const garageIds = [...new Set(garageWithdrawals.map((row) => row.garage_id))]
  const [driversRes, garagesRes] = await Promise.all([
    driverIds.length
      ? supabase.from('profiles').select('id, full_name').in('id', driverIds)
      : Promise.resolve({ data: [] }),
    garageIds.length
      ? supabase.from('garages').select('id, shop_name').in('id', garageIds)
      : Promise.resolve({ data: [] }),
  ])

  const driverById = Object.fromEntries((driversRes.data ?? []).map((row) => [row.id, row]))
  const garageById = Object.fromEntries((garagesRes.data ?? []).map((row) => [row.id, row]))

  return [
    ...driverInvoices.map((row) => ({
      id: row.id,
      type: 'driver_withdrawal' as const,
      actorName: driverById[row.driver_id]?.full_name ?? 'Driver',
      status: row.status,
      amountVnd: row.amount_vnd,
      createdAt: row.requested_at,
      href: '/admin/invoices/driver',
    })),
    ...garageWithdrawals.map((row) => ({
      id: row.id,
      type: 'garage_withdrawal' as const,
      actorName: garageById[row.garage_id]?.shop_name ?? 'Garage',
      status: row.status,
      amountVnd: row.amount_vnd,
      createdAt: row.requested_at,
      href: '/admin/invoices/garage',
    })),
  ]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 8)
}
