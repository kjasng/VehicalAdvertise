import { NextResponse, type NextRequest } from 'next/server'

import { createSupabaseServerClient } from '@/lib/supabase/server'

/**
 * Returns the GPS trail for a contract.
 *
 * Phase 1 stub: returns []. Phase 5 wires the real query against `gps_logs`
 * (RLS already scopes reads to the caller's role).
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

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
