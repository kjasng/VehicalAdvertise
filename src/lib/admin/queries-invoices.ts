import 'server-only'

import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export type InvoiceRow = {
  id: number | string
  invoiceNumber?: string
  recipientName: string
  amountVnd: number
  kind: string
  createdAt: string
  status?: string
  periodStart?: string
  periodEnd?: string
  printHref?: string
  note: string | null
}

export async function getDriverInvoices(): Promise<InvoiceRow[]> {
  const supabase = createSupabaseAdminClient()

  const { data: invoices, error } = await supabase
    .from('driver_invoices')
    .select(
      'id, invoice_number, driver_id, campaign_id, amount_vnd, status, period_start, period_end, requested_at, created_at',
    )
    .order('requested_at', { ascending: false })
    .limit(100)

  if (error || !invoices?.length) return []

  const driverIds = [...new Set(invoices.map((invoice) => invoice.driver_id))]
  const campaignIds = [...new Set(invoices.map((invoice) => invoice.campaign_id))]

  const [profilesRes, campaignsRes] = await Promise.all([
    driverIds.length
      ? supabase.from('profiles').select('id, full_name, email, phone_e164').in('id', driverIds)
      : Promise.resolve({ data: [] }),
    campaignIds.length
      ? supabase.from('campaigns').select('id, name').in('id', campaignIds)
      : Promise.resolve({ data: [] }),
  ])

  const profileById = Object.fromEntries(
    (profilesRes.data ?? []).map((profile) => [profile.id, profile]),
  )
  const campaignById = Object.fromEntries(
    (campaignsRes.data ?? []).map((campaign) => [campaign.id, campaign.name]),
  )

  return invoices.map((invoice) => {
    const profile = profileById[invoice.driver_id]
    const period = `${invoice.period_start} → ${invoice.period_end}`
    return {
      id: invoice.id,
      invoiceNumber: invoice.invoice_number,
      recipientName: profile?.full_name ?? profile?.email ?? 'Unknown driver',
      amountVnd: invoice.amount_vnd,
      kind: 'driver_withdrawal',
      createdAt: invoice.requested_at ?? invoice.created_at,
      status: invoice.status,
      periodStart: invoice.period_start,
      periodEnd: invoice.period_end,
      printHref: `/admin/invoices/driver/${invoice.id}/print`,
      note: `${campaignById[invoice.campaign_id] ?? 'Campaign'} · ${period}`,
    }
  })
}

export async function getPartnerInvoices(): Promise<InvoiceRow[]> {
  const supabase = createSupabaseAdminClient()

  const { data: periods, error } = await supabase
    .from('driver_earning_periods')
    .select(
      'id, campaign_id, driver_id, period_start, period_end, gross_charge_vnd, platform_fee_vnd, driver_net_vnd, created_at',
    )
    .order('period_start', { ascending: false })
    .limit(100)

  if (error || !periods?.length) return []

  const campaignIds = [...new Set(periods.map((period) => period.campaign_id))]
  const driverIds = [...new Set(periods.map((period) => period.driver_id))]
  const [campaignsRes, driversRes] = await Promise.all([
    supabase.from('campaigns').select('id, name, partner_id').in('id', campaignIds),
    supabase.from('profiles').select('id, full_name').in('id', driverIds),
  ])

  const campaigns = campaignsRes.data ?? []
  const partnerIds = [...new Set(campaigns.map((campaign) => campaign.partner_id))]
  const { data: partners } = partnerIds.length
    ? await supabase.from('partners').select('id, company_name').in('id', partnerIds)
    : { data: [] }

  const campaignById = Object.fromEntries(campaigns.map((campaign) => [campaign.id, campaign]))
  const partnerById = Object.fromEntries((partners ?? []).map((partner) => [partner.id, partner]))
  const driverById = Object.fromEntries(
    (driversRes.data ?? []).map((driver) => [driver.id, driver]),
  )

  return periods.map((period) => {
    const campaign = campaignById[period.campaign_id]
    const partner = campaign ? partnerById[campaign.partner_id] : null
    const periodLabel = `${period.period_start} → ${period.period_end}`
    return {
      id: period.id,
      invoiceNumber: `PINV-${period.period_start.replaceAll('-', '')}-${period.id.slice(0, 8).toUpperCase()}`,
      recipientName: partner?.company_name ?? 'Unknown partner',
      amountVnd: period.gross_charge_vnd,
      kind: 'partner_campaign_charge',
      createdAt: period.created_at,
      status: 'issued',
      periodStart: period.period_start,
      periodEnd: period.period_end,
      printHref: `/admin/invoices/partner/${period.id}/print`,
      note: `${campaign?.name ?? 'Campaign'} · ${driverById[period.driver_id]?.full_name ?? 'Driver'} · ${periodLabel}`,
    }
  })
}

export async function getGarageInvoices(): Promise<InvoiceRow[]> {
  const supabase = createSupabaseAdminClient()

  const { data: withdrawals, error } = await supabase
    .from('garage_withdrawals')
    .select('id, withdrawal_number, garage_id, amount_vnd, status, requested_at, paid_at')
    .order('requested_at', { ascending: false })
    .limit(100)

  if (error || !withdrawals?.length) return []

  const garageIds = [...new Set(withdrawals.map((row) => row.garage_id))]
  const { data: garages } = await supabase
    .from('garages')
    .select('id, shop_name, address')
    .in('id', garageIds)

  const garageById = Object.fromEntries((garages ?? []).map((garage) => [garage.id, garage]))

  return withdrawals.map((withdrawal) => {
    const garage = garageById[withdrawal.garage_id]
    return {
      id: withdrawal.id,
      invoiceNumber: withdrawal.withdrawal_number,
      recipientName: garage?.shop_name ?? 'Unknown garage',
      amountVnd: withdrawal.amount_vnd,
      kind: 'garage_withdrawal',
      createdAt: withdrawal.requested_at,
      status: withdrawal.status,
      printHref: `/admin/invoices/garage/${withdrawal.id}/print`,
      note: garage?.address ?? null,
    }
  })
}
