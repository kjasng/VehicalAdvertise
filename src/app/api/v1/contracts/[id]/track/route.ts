import { NextResponse, type NextRequest } from 'next/server'

import { createSupabaseServerClient } from '@/lib/supabase/server'

/**
 * Returns the GPS trail for a contract.
 *
 * Phase 1 stub: returns []. Phase 5 wires the real query against `gps_logs`
 * (RLS already scopes reads to the caller's role).
 */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // Reject malformed UUIDs before hitting Postgres so callers see 400 (bad
  // request) instead of 404 (not found).
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 })
  }

  const supabase = await createSupabaseServerClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  // Verify the caller can read the contract under their RLS scope. If RLS
  // denies, .maybeSingle() returns null without leaking row existence.
  const { data: contract } = await supabase
    .from('contracts')
    .select('id')
    .eq('id', id)
    .maybeSingle()

  if (!contract) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  return NextResponse.json({ contract_id: id, points: [] })
}
