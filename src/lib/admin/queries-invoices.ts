import 'server-only'

import type { Database } from '@/types/db'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

type LedgerKind = Database['public']['Enums']['ledger_kind']

export type InvoiceRow = {
  id: number
  recipientName: string
  amountVnd: number
  kind: string
  createdAt: string
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
  return fetchLedgerRows(createSupabaseAdminClient(), ['driver_payout'], 'driver_id')
}

export async function getPartnerInvoices(): Promise<InvoiceRow[]> {
  return fetchLedgerRows(
    createSupabaseAdminClient(),
    ['partner_topup', 'partner_charge'],
    'partner_id',
  )
}

// Garage invoices: ledger_entries has no garage_id, so install payouts map through
// contract_id -> contracts.install_garage_id.
export async function getGarageInvoices(): Promise<InvoiceRow[]> {
  const supabase = createSupabaseAdminClient()

  const { data: entries, error } = await supabase
    .from('ledger_entries')
    .select('id, ts, kind, amount_vnd, note, contract_id')
    .eq('kind', 'garage_install_payout')
    .not('contract_id', 'is', null)
    .order('ts', { ascending: false })
    .limit(100)

  if (error || !entries?.length) return []

  const contractIds = [
    ...new Set(entries.map((e) => e.contract_id).filter((id): id is string => id != null)),
  ]

  const { data: contracts } = await supabase
    .from('contracts')
    .select('id, install_garage_id')
    .in('id', contractIds)
    .not('install_garage_id', 'is', null)

  const garageIdByContract = Object.fromEntries(
    (contracts ?? []).map((c) => [c.id, c.install_garage_id]),
  )

  const garageIds = [
    ...new Set(
      Object.values(garageIdByContract).filter((id): id is string => typeof id === 'string'),
    ),
  ]
  if (garageIds.length === 0) return []

  const { data: garages } = await supabase
    .from('garages')
    .select('id, shop_name')
    .in('id', garageIds)

  const nameById = Object.fromEntries((garages ?? []).map((g) => [g.id, g.shop_name]))

  return entries
    .filter((e) => e.contract_id && garageIdByContract[e.contract_id!])
    .map((e) => {
      const garageId = garageIdByContract[e.contract_id!]
      return {
        id: e.id,
        recipientName: garageId ? (nameById[garageId] ?? 'Unknown garage') : 'Unknown garage',
        amountVnd: e.amount_vnd,
        kind: e.kind,
        createdAt: e.ts,
        note: e.note,
      }
    })
}
