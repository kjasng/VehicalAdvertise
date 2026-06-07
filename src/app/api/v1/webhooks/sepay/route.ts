import { revalidatePath } from 'next/cache'
import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'

import { PARTNER_MIN_DEPOSIT_VND } from '@/lib/partner/constants'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import type { Json } from '@/types/db'

const SePayPayloadSchema = z
  .object({
    id: z.union([z.number().int(), z.string().trim().min(1)]).transform(String),
    accountNumber: z.string().trim().min(1),
    content: z.string().trim().default(''),
    description: z.string().trim().optional().nullable(),
    transferType: z.string().trim().toLowerCase(),
    transferAmount: z.coerce.number().int().positive(),
    referenceCode: z.string().trim().optional().nullable(),
  })
  .passthrough()

const TAX_CODE_RE = /(?:^|[^a-z0-9])topup\s*([0-9]{10,13})(?:[^0-9]|$)/i

type RpcResult = {
  status?: string
}

export async function POST(request: NextRequest) {
  const expectedKey = process.env.SEPAY_WEBHOOK_API_KEY?.trim()
  if (!expectedKey) {
    return NextResponse.json({ success: false, error: 'missing_webhook_key' }, { status: 500 })
  }

  const providedKey = parseApiKey(request.headers.get('authorization'))
  if (providedKey !== expectedKey) {
    return NextResponse.json({ success: false, error: 'unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'invalid_json' }, { status: 400 })
  }

  const parsed = SePayPayloadSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'invalid_payload' }, { status: 400 })
  }

  const payload = parsed.data
  const taxCode = extractTaxCode(
    payload.content,
    payload.description ?? '',
    payload.referenceCode ?? '',
  )
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase.rpc('process_sepay_partner_topup_webhook', {
    p_txn_id: payload.id,
    p_payload: payload as Json,
    p_tax_code: taxCode ?? '',
    p_amount_vnd: payload.transferAmount,
    p_transfer_type: payload.transferType,
    p_account_number: payload.accountNumber,
    p_expected_account_number: process.env.SEPAY_TOPUP_BANK_ACCOUNT?.trim() || undefined,
    p_min_amount_vnd: getMinimumTopupVnd(),
  })

  if (error) {
    console.error('[sepay-webhook] rpc error:', error.message)
    return NextResponse.json({ success: false, error: 'processing_failed' }, { status: 500 })
  }

  const result = data as RpcResult
  if (result.status === 'processed') {
    revalidatePath('/admin/partner-balances')
    revalidatePath('/admin/dashboard')
    revalidatePath('/admin/invoices/partner')
    revalidatePath('/partner/billing')
    revalidatePath('/partner/dashboard')
  }

  return NextResponse.json({ success: true })
}

function parseApiKey(header: string | null): string | null {
  if (!header) return null
  const match = header.trim().match(/^Apikey\s+(.+)$/i)
  return match?.[1]?.trim() ?? null
}

function extractTaxCode(...values: string[]): string | null {
  for (const value of values) {
    const match = value.match(TAX_CODE_RE)
    if (match?.[1]) return match[1]
  }
  return null
}

function getMinimumTopupVnd(): number {
  const configured = process.env.SEPAY_MIN_TOPUP_VND?.trim()
  if (!configured) return PARTNER_MIN_DEPOSIT_VND

  const value = Number(configured)
  return Number.isInteger(value) && value > 0 ? value : PARTNER_MIN_DEPOSIT_VND
}
