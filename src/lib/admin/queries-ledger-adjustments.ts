import 'server-only'

import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export type LedgerAdjustmentRow = {
  id: number
  ts: string
  kind: string
  targetType: 'partner' | 'driver' | 'unknown'
  targetName: string
  amountVnd: number
  note: string | null
}

export type LedgerTarget = {
  id: string
  name: string
  type: 'partner' | 'driver'
}

/** Recent adjustment + refund ledger entries (audit history). */
export async function getRecentAdjustments(): Promise<LedgerAdjustmentRow[]> {
  const supabase = createSupabaseAdminClient()

  const { data, error } = await supabase
    .from('ledger_entries')
    .select('id, ts, kind, partner_id, driver_id, amount_vnd, note')
    .in('kind', ['adjustment', 'refund'])
    .order('ts', { ascending: false })
    .limit(100)

  if (error || !data?.length) return []

  const partnerIds = [...new Set(data.map((e) => e.partner_id).filter(Boolean))] as string[]
  const driverIds = [...new Set(data.map((e) => e.driver_id).filter(Boolean))] as string[]
  const allIds = [...new Set([...partnerIds, ...driverIds])]

  const { data: profiles } = allIds.length
    ? await supabase.from('profiles').select('id, full_name').in('id', allIds)
    : { data: [] }
  const { data: partners } = partnerIds.length
    ? await supabase.from('partners').select('id, company_name').in('id', partnerIds)
    : { data: [] }

  const profileName = Object.fromEntries((profiles ?? []).map((p) => [p.id, p.full_name]))
  const companyName = Object.fromEntries((partners ?? []).map((p) => [p.id, p.company_name]))

  return data.map((e) => {
    let targetType: LedgerAdjustmentRow['targetType'] = 'unknown'
    let targetName = '—'
    if (e.partner_id) {
      targetType = 'partner'
      targetName = companyName[e.partner_id] ?? profileName[e.partner_id] ?? 'Unknown partner'
    } else if (e.driver_id) {
      targetType = 'driver'
      targetName = profileName[e.driver_id] ?? 'Unknown driver'
    }
    return {
      id: e.id,
      ts: e.ts,
      kind: e.kind,
      targetType,
      targetName,
      amountVnd: e.amount_vnd,
      note: e.note,
    }
  })
}

/** Partners + drivers list for the adjustment target dropdown. */
export async function getLedgerTargets(): Promise<LedgerTarget[]> {
  const supabase = createSupabaseAdminClient()

  const [partnersRes, driverRowsRes] = await Promise.all([
    supabase.from('partners').select('id, company_name').order('company_name', { ascending: true }),
    supabase.from('drivers').select('id'),
  ])

  const driverIds = (driverRowsRes.data ?? []).map((driver) => driver.id)
  const { data: driverProfiles } = driverIds.length
    ? await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', driverIds)
        .order('full_name', { ascending: true })
    : { data: [] }

  const partners: LedgerTarget[] = (partnersRes.data ?? []).map((p) => ({
    id: p.id,
    name: p.company_name,
    type: 'partner',
  }))
  const drivers: LedgerTarget[] = (driverProfiles ?? []).map((d) => ({
    id: d.id,
    name: d.full_name,
    type: 'driver',
  }))

  return [...partners, ...drivers]
}
