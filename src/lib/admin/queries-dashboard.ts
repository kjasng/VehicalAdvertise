import 'server-only'

import { createSupabaseAdminClient } from '@/lib/supabase/admin'

import { getPendingDriverKycRequestCount } from './queries-kyc'

export type RecentRequestRow = {
  id: string
  type: 'driver_withdrawal' | 'garage_withdrawal' | 'driver_kyc'
  actorName: string
  status: string
  amountVnd: number
  createdAt: string
  href: string
}

export type DashboardStats = {
  totalDrivers: number
  pendingKyc: number
  activePartners: number
  pendingPartners: number
  activeCampaigns: number
  pendingPayouts: number
  recentRequests: RecentRequestRow[]
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = createSupabaseAdminClient()

  const [
    driversRes,
    pendingKycCount,
    partnersRes,
    pendingPartnersRes,
    campaignsRes,
    driverWithdrawalsRes,
    garageWithdrawalsRes,
    recentDriverInvoicesRes,
    recentGarageWithdrawalsRes,
    recentKycRes,
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'driver'),
    getPendingDriverKycRequestCount(),
    // Active partners = approved only
    supabase.from('partners').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
    // Pending partner reviews
    supabase.from('partners').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
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
    supabase
      .from('profiles')
      .select('id, full_name, created_at, kyc_status')
      .eq('role', 'driver')
      .eq('kyc_status', 'pending')
      .order('created_at', { ascending: false })
      .limit(50),
  ])

  // Log any query failures — dashboard returns zeros on partial failure so errors
  // would otherwise be invisible in the UI.
  const queryErrors = [
    driversRes.error,
    partnersRes.error,
    pendingPartnersRes.error,
    campaignsRes.error,
    driverWithdrawalsRes.error,
    garageWithdrawalsRes.error,
    recentDriverInvoicesRes.error,
    recentGarageWithdrawalsRes.error,
    recentKycRes.error,
  ].filter(Boolean)
  if (queryErrors.length) {
    console.error(
      '[getDashboardStats] query errors:',
      queryErrors.map((e) => e!.message),
    )
  }

  const submittedKycProfiles = await filterSubmittedKycProfiles(recentKycRes.data ?? [])
  const recentRequests = await hydrateRecentRequests({
    driverInvoices: recentDriverInvoicesRes.data ?? [],
    garageWithdrawals: recentGarageWithdrawalsRes.data ?? [],
    kycProfiles: submittedKycProfiles,
  })

  return {
    totalDrivers: driversRes.count ?? 0,
    pendingKyc: pendingKycCount,
    activePartners: partnersRes.count ?? 0,
    pendingPartners: pendingPartnersRes.count ?? 0,
    activeCampaigns: campaignsRes.count ?? 0,
    pendingPayouts: (driverWithdrawalsRes.count ?? 0) + (garageWithdrawalsRes.count ?? 0),
    recentRequests,
  }
}

async function filterSubmittedKycProfiles(
  profiles: { id: string; full_name: string; created_at: string; kyc_status: string }[],
) {
  if (!profiles.length) return []
  const supabase = createSupabaseAdminClient()
  const { data: photos, error } = await supabase
    .from('photos')
    .select('subject_id')
    .in(
      'subject_id',
      profiles.map((profile) => profile.id),
    )
    .in('kind', ['kyc_cccd_front', 'kyc_cccd_back', 'kyc_selfie'])

  if (error) {
    console.error('[getDashboardStats] submitted KYC photos error:', error.message)
    return []
  }

  const submittedIds = new Set((photos ?? []).map((photo) => photo.subject_id))
  return profiles.filter((profile) => submittedIds.has(profile.id)).slice(0, 5)
}

async function hydrateRecentRequests({
  driverInvoices,
  garageWithdrawals,
  kycProfiles,
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
  kycProfiles: { id: string; full_name: string; created_at: string; kyc_status: string }[]
}): Promise<RecentRequestRow[]> {
  const supabase = createSupabaseAdminClient()
  const driverIds = [
    ...new Set([
      ...driverInvoices.map((row) => row.driver_id),
      ...kycProfiles.map((row) => row.id),
    ]),
  ]
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
    ...kycProfiles.map((row) => ({
      id: row.id,
      type: 'driver_kyc' as const,
      actorName: row.full_name,
      status: row.kyc_status,
      amountVnd: 0,
      createdAt: row.created_at,
      href: '/admin/drivers-kyc',
    })),
  ]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 8)
}
