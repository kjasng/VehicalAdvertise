import 'server-only'

import type { Database } from '@/types/db'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

type LedgerKind = Database['public']['Enums']['ledger_kind']

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

async function fetchLedgerRows(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  kinds: LedgerKind[],
  idColumn: 'driver_id' | 'partner_id',
): Promise<InvoiceRow[]> {
  const { data: entries, error } = await supabase
    .from('ledger_entries')
    .select(`id, ts, kind, amount_vnd, note, ${idColumn}`)
    .in('kind', kinds)
    .not(idColumn, 'is', null)
    .order('ts', { ascending: false })
    .limit(100)

  if (error || !entries?.length) return []

  const profileIds = [
    ...new Set(
      entries.map((e) => (e as Record<string, unknown>)[idColumn] as string).filter(Boolean),
    ),
  ]

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name')
    .in('id', profileIds)

  const nameById = Object.fromEntries((profiles ?? []).map((p) => [p.id, p.full_name]))

  return entries.map((e) => {
    const profileId = (e as Record<string, unknown>)[idColumn] as string
    return {
      id: e.id,
      recipientName: nameById[profileId] ?? 'Unknown',
      amountVnd: e.amount_vnd,
      kind: e.kind,
      createdAt: e.ts,
      note: e.note,
    }
  })
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
  return fetchLedgerRows(
    createSupabaseAdminClient(),
    ['partner_topup', 'partner_charge'],
    'partner_id',
  )
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
