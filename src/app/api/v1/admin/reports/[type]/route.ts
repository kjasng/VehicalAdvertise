import { NextResponse, type NextRequest } from 'next/server'

import { csvResponse, toCsv } from '@/lib/admin/csv-helpers'
import { getCurrentUserRole } from '@/lib/auth/role-gate'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

function haversineMetres(
  lat1: number | null,
  lng1: number | null,
  lat2: number | null,
  lng2: number | null,
): number | null {
  if (lat1 == null || lng1 == null || lat2 == null || lng2 == null) return null
  const R = 6_371_000
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return Math.round(R * 2 * Math.asin(Math.sqrt(a)))
}

type Params = Promise<{ type: string }>

const ALLOWED_TYPES = new Set(['drivers', 'campaigns', 'invoices', 'fraud'])

export async function GET(_req: NextRequest, { params }: { params: Params }) {
  const { type } = await params

  if (!ALLOWED_TYPES.has(type)) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  const role = await getCurrentUserRole()
  if (role !== 'admin') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const supabase = createSupabaseAdminClient()

  if (type === 'drivers') {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, phone_e164, kyc_status, blocked, created_at')
      .eq('role', 'driver')
      .order('created_at', { ascending: false })
      .limit(10000)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const csv = toCsv(
      ['ID', 'Full Name', 'Email', 'Phone', 'KYC Status', 'Blocked', 'Joined At'],
      (data ?? []).map((r) => [
        r.id,
        r.full_name,
        r.email ?? '',
        r.phone_e164 ?? '',
        r.kyc_status,
        r.blocked ? 'yes' : 'no',
        r.created_at,
      ]),
    )
    return csvResponse('drivers.csv', csv)
  }

  if (type === 'campaigns') {
    const { data, error } = await supabase
      .from('campaigns')
      .select('id, name, status, start_date, end_date, budget_vnd, created_at, partner_id')
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const partnerIds = [...new Set((data ?? []).map((c) => c.partner_id).filter(Boolean))]
    const { data: partners } = partnerIds.length
      ? await supabase.from('profiles').select('id, full_name').in('id', partnerIds)
      : { data: [] }

    const partnerName = Object.fromEntries((partners ?? []).map((p) => [p.id, p.full_name]))

    const csv = toCsv(
      ['ID', 'Name', 'Partner', 'Status', 'Start Date', 'End Date', 'Budget VND', 'Created At'],
      (data ?? []).map((r) => [
        r.id,
        r.name,
        r.partner_id ? (partnerName[r.partner_id] ?? 'Unknown') : '',
        r.status,
        r.start_date ?? '',
        r.end_date ?? '',
        r.budget_vnd ?? '',
        r.created_at,
      ]),
    )
    return csvResponse('campaigns.csv', csv)
  }

  if (type === 'invoices') {
    const { data, error } = await supabase
      .from('ledger_entries')
      .select('id, ts, kind, amount_vnd, note, driver_id, partner_id')
      .order('ts', { ascending: false })
      .limit(5000)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const profileIds = [
      ...new Set(
        (data ?? [])
          .flatMap((e) => [e.driver_id, e.partner_id])
          .filter((id): id is string => id != null),
      ),
    ]
    const { data: profiles } = profileIds.length
      ? await supabase.from('profiles').select('id, full_name').in('id', profileIds)
      : { data: [] }

    const nameById = Object.fromEntries((profiles ?? []).map((p) => [p.id, p.full_name]))

    const csv = toCsv(
      ['ID', 'Timestamp', 'Kind', 'Amount VND', 'Recipient', 'Note'],
      (data ?? []).map((r) => {
        const recipientId = r.driver_id ?? r.partner_id
        return [
          r.id,
          r.ts,
          r.kind,
          r.amount_vnd,
          recipientId ? (nameById[recipientId] ?? 'Unknown') : '',
          r.note ?? '',
        ]
      }),
    )
    return csvResponse('invoices.csv', csv)
  }

  // type === 'fraud'
  const { data, error } = await supabase
    .from('photos')
    .select(
      'id, kind, status, reject_reason, created_at, reviewed_at, subject_id, exif_lat, exif_lng, client_lat, client_lng',
    )
    .in('kind', ['periodic_vehicle', 'periodic_selfie'])
    .in('status', ['rejected', 'pending'])
    .order('created_at', { ascending: false })
    .limit(2000)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const driverIds = [...new Set((data ?? []).map((p) => p.subject_id).filter(Boolean))]
  const { data: profiles } = driverIds.length
    ? await supabase.from('profiles').select('id, full_name').in('id', driverIds)
    : { data: [] }

  const nameById = Object.fromEntries((profiles ?? []).map((p) => [p.id, p.full_name]))

  const csv = toCsv(
    ['ID', 'Driver', 'Kind', 'Status', 'GPS Delta (m)', 'Reject Reason', 'Date', 'Reviewed At'],
    (data ?? []).map((r) => {
      const gpsDelta = haversineMetres(r.exif_lat, r.exif_lng, r.client_lat, r.client_lng)
      return [
        r.id,
        nameById[r.subject_id] ?? 'Unknown',
        r.kind,
        r.status,
        gpsDelta ?? '',
        r.reject_reason ?? '',
        r.created_at,
        r.reviewed_at ?? '',
      ]
    }),
  )
  return csvResponse('fraud.csv', csv)
}
