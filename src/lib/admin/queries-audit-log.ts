import 'server-only'

import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export type AuditLogRow = {
  id: number
  actorName: string
  action: string
  entityType: string
  entityId: string | null
  diff: Record<string, unknown> | null
  ts: string
}

export interface AuditLogFilters {
  action?: string
  actorId?: string
  /** ISO date string — include only entries at or after this timestamp */
  from?: string
  /** ISO date string — include only entries at or before this timestamp */
  to?: string
  limit?: number
}

/** Known action values surfaced as filter options in the UI. */
export const AUDIT_ACTIONS = [
  'photo_verif_approved',
  'photo_verif_rejected',
  'kyc_approved',
  'kyc_rejected',
  'campaign_approved',
  'campaign_rejected',
  'install_proof_approved',
  'install_proof_rejected',
  'set_user_blocked',
  'payout_created',
  'payout_marked_paid',
] as const

export async function getAuditLog(filters: AuditLogFilters = {}): Promise<AuditLogRow[]> {
  const supabase = createSupabaseAdminClient()
  const { action, actorId, from, to, limit = 100 } = filters

  let query = supabase
    .from('audit_log')
    .select('id, actor_id, action, entity_type, entity_id, diff, ts')
    .order('ts', { ascending: false })
    .limit(limit)

  if (action) query = query.eq('action', action)
  if (actorId) query = query.eq('actor_id', actorId)
  if (from) query = query.gte('ts', from)
  if (to) query = query.lte('ts', to)

  const { data: rows, error } = await query

  if (error) {
    console.error('[getAuditLog] query error:', error.message)
    return []
  }
  if (!rows?.length) return []

  // Resolve actor names
  const actorIds = [
    ...new Set(rows.map((r) => r.actor_id).filter((id): id is string => id != null)),
  ]
  const { data: profiles } = actorIds.length
    ? await supabase.from('profiles').select('id, full_name').in('id', actorIds)
    : { data: [] }

  const nameById = Object.fromEntries((profiles ?? []).map((p) => [p.id, p.full_name]))

  return rows.map((r) => ({
    id: r.id,
    actorName: r.actor_id ? (nameById[r.actor_id] ?? 'Unknown') : 'System',
    action: r.action,
    entityType: r.entity_type,
    entityId: r.entity_id,
    diff: (r.diff as Record<string, unknown> | null) ?? null,
    ts: r.ts,
  }))
}
