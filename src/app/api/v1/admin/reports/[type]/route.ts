import { NextResponse, type NextRequest } from 'next/server'

import { csvResponse, toCsv } from '@/lib/admin/csv-helpers'
import {
  currentMonthString,
  getReportsData,
  monthRange,
  nextMonthStart,
} from '@/lib/admin/queries-reports'
import { getCurrentUserRole } from '@/lib/auth/role-gate'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

type Params = Promise<{ type: string }>

const ALLOWED_TYPES = new Set([
  'driver-invoices',
  'partner-invoices',
  'garage-invoices',
  'net-profit',
])

export async function GET(req: NextRequest, { params }: { params: Params }) {
  const { type } = await params
  if (!ALLOWED_TYPES.has(type)) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  const role = await getCurrentUserRole()
  if (role !== 'admin') return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  const rawMonth = req.nextUrl.searchParams.get('month') ?? currentMonthString()
  const month = /^\d{4}-\d{2}$/.test(rawMonth) ? rawMonth : currentMonthString()
  const [start, end] = monthRange(month)
  const nextStart = nextMonthStart(month)
  const supabase = createSupabaseAdminClient()

  if (type === 'driver-invoices') {
    const { data, error } = await supabase
      .from('driver_invoices')
      .select(
        'id, invoice_number, driver_id, amount_vnd, status, period_start, period_end, requested_at, paid_at',
      )
      .gte('requested_at', start)
      .lt('requested_at', nextStart)
      .order('requested_at', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const names = await profileNames((data ?? []).map((row) => row.driver_id))
    const csv = toCsv(
      [
        'ID',
        'Invoice Number',
        'Driver',
        'Amount VND',
        'Status',
        'Period Start',
        'Period End',
        'Requested At',
        'Paid At',
      ],
      (data ?? []).map((row) => [
        row.id,
        row.invoice_number,
        names[row.driver_id] ?? 'Unknown',
        row.amount_vnd,
        row.status,
        row.period_start,
        row.period_end,
        row.requested_at,
        row.paid_at ?? '',
      ]),
    )
    return csvResponse(`driver-invoices-${month}.csv`, csv)
  }

  if (type === 'partner-invoices') {
    const { data, error } = await supabase
      .from('driver_earning_periods')
      .select(
        'id, campaign_id, driver_id, period_start, period_end, gross_charge_vnd, platform_fee_vnd, driver_net_vnd, created_at',
      )
      .gte('period_start', start)
      .lte('period_start', end)
      .order('period_start', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const campaignMap = await campaignsById((data ?? []).map((row) => row.campaign_id))
    const driverNames = await profileNames((data ?? []).map((row) => row.driver_id))
    const csv = toCsv(
      [
        'ID',
        'Partner',
        'Campaign',
        'Driver',
        'Gross Charge VND',
        'Platform Fee VND',
        'Driver Net VND',
        'Period Start',
        'Period End',
      ],
      (data ?? []).map((row) => {
        const campaign = campaignMap[row.campaign_id]
        return [
          row.id,
          campaign?.partnerName ?? 'Unknown',
          campaign?.name ?? 'Campaign',
          driverNames[row.driver_id] ?? 'Unknown',
          row.gross_charge_vnd,
          row.platform_fee_vnd,
          row.driver_net_vnd,
          row.period_start,
          row.period_end,
        ]
      }),
    )
    return csvResponse(`partner-invoices-${month}.csv`, csv)
  }

  if (type === 'garage-invoices') {
    const { data, error } = await supabase
      .from('garage_withdrawals')
      .select('id, withdrawal_number, garage_id, amount_vnd, status, requested_at, paid_at')
      .gte('requested_at', start)
      .lt('requested_at', nextStart)
      .order('requested_at', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const names = await garageNames((data ?? []).map((row) => row.garage_id))
    const csv = toCsv(
      ['ID', 'Withdrawal Number', 'Garage', 'Amount VND', 'Status', 'Requested At', 'Paid At'],
      (data ?? []).map((row) => [
        row.id,
        row.withdrawal_number,
        names[row.garage_id] ?? 'Unknown',
        row.amount_vnd,
        row.status,
        row.requested_at,
        row.paid_at ?? '',
      ]),
    )
    return csvResponse(`garage-invoices-${month}.csv`, csv)
  }

  const report = await getReportsData(month)
  const csv = toCsv(
    [
      'Month',
      'Paid To Drivers VND',
      'Received From Partners VND',
      'Paid To Garages VND',
      'Net Profit VND',
    ],
    [
      [
        month,
        report.totals.driverPaidVnd,
        report.totals.partnerReceivedVnd,
        report.totals.garagePaidVnd,
        report.totals.netProfitVnd,
      ],
    ],
  )
  return csvResponse(`net-profit-${month}.csv`, csv)
}

async function profileNames(ids: string[]) {
  const uniqueIds = [...new Set(ids)]
  if (!uniqueIds.length) return {}
  const { data } = await createSupabaseAdminClient()
    .from('profiles')
    .select('id, full_name')
    .in('id', uniqueIds)
  return Object.fromEntries((data ?? []).map((row) => [row.id, row.full_name]))
}

async function garageNames(ids: string[]) {
  const uniqueIds = [...new Set(ids)]
  if (!uniqueIds.length) return {}
  const { data } = await createSupabaseAdminClient()
    .from('garages')
    .select('id, shop_name')
    .in('id', uniqueIds)
  return Object.fromEntries((data ?? []).map((row) => [row.id, row.shop_name]))
}

async function campaignsById(ids: string[]) {
  const uniqueIds = [...new Set(ids)]
  if (!uniqueIds.length) return {}
  const supabase = createSupabaseAdminClient()
  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('id, name, partner_id')
    .in('id', uniqueIds)
  const partnerIds = [...new Set((campaigns ?? []).map((row) => row.partner_id))]
  const { data: partners } = partnerIds.length
    ? await supabase.from('partners').select('id, company_name').in('id', partnerIds)
    : { data: [] }
  const partnerById = Object.fromEntries((partners ?? []).map((row) => [row.id, row.company_name]))
  return Object.fromEntries(
    (campaigns ?? []).map((row) => [
      row.id,
      { name: row.name, partnerName: partnerById[row.partner_id] ?? 'Unknown' },
    ]),
  )
}
