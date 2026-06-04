'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { getCurrentUserRole } from '@/lib/auth/role-gate'
import { DRIVER_GROSS_MONTHLY_VND, MIN_CAMPAIGN_MONTHS, formatVnd } from '@/lib/partner/constants'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const CampaignSchema = z.object({
  name: z.string().trim().min(3, 'Campaign name must be at least 3 characters'),
  description: z.string().trim().min(10, 'Description must be at least 10 characters'),
  districts: z.string().trim().min(1, 'Enter at least one district'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date is required'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date is required'),
  creativeUrls: z.string().trim().min(1, 'Upload or enter at least one creative URL'),
  driverCount: z.number().int().positive('Number of drivers must be positive').max(10_000),
  monthlyCapVnd: z.number().int().positive('Monthly cap must be positive').max(999_999_999_999),
  qrTargetUrl: z.string().url('QR target URL must be a valid URL'),
})

export async function createPartnerCampaign(raw: unknown): Promise<{ error: string | null }> {
  const parsed = CampaignSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }

  const role = await getCurrentUserRole()
  if (role !== 'partner') return { error: 'Forbidden' }

  const serverClient = await createSupabaseServerClient()
  const {
    data: { user },
  } = await serverClient.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const data = parsed.data
  const creativeUrls = parseCreativeUrls(data.creativeUrls)
  if (!creativeUrls.length) return { error: 'Upload or enter at least one creative URL' }

  if (!hasMinimumDuration(data.startDate, data.endDate)) {
    return { error: 'Chiến dịch phải kéo dài tối thiểu 3 tháng.' }
  }

  const requiredMonthlyBudget = data.driverCount * DRIVER_GROSS_MONTHLY_VND
  if (data.monthlyCapVnd < requiredMonthlyBudget) {
    return {
      error: `Monthly Cap không đủ để chi trả cho ${data.driverCount} Driver. Yêu cầu tối thiểu: ${formatVnd(requiredMonthlyBudget)}/tháng`,
    }
  }

  const supabase = createSupabaseAdminClient()
  const { data: partner } = await supabase
    .from('partners')
    .select('balance_vnd, status')
    .eq('id', user.id)
    .maybeSingle()

  if (partner?.status !== 'approved') return { error: 'Partner account is not active yet.' }

  const minimumRequiredBalance = requiredMonthlyBudget * MIN_CAMPAIGN_MONTHS
  if ((partner.balance_vnd ?? 0) < minimumRequiredBalance) {
    return {
      error: `Số dư hiện tại không đủ cho số lượng Driver đã chọn. Yêu cầu: ${formatVnd(minimumRequiredBalance)}. Hiện có: ${formatVnd(partner.balance_vnd ?? 0)}.`,
    }
  }

  const durationMonths = countBillingMonths(data.startDate, data.endDate)
  const { error } = await supabase.from('campaigns').insert({
    partner_id: user.id,
    name: data.name,
    brief: data.description,
    creative_url: creativeUrls[0],
    creative_urls: creativeUrls,
    qr_target_url: data.qrTargetUrl,
    budget_vnd: data.monthlyCapVnd * durationMonths,
    rate_per_km_vnd: 0,
    start_date: data.startDate,
    end_date: data.endDate,
    target_districts: splitList(data.districts),
    status: 'submitted',
    funding_mode: 'monthly_cap',
    monthly_budget_vnd: data.monthlyCapVnd,
    driver_net_monthly_vnd: DRIVER_GROSS_MONTHLY_VND,
    platform_fee_pct: 0,
    active_driver_limit: data.driverCount,
    requested_driver_count: data.driverCount,
  })

  if (error) return { error: error.message }

  revalidatePath('/partner/campaigns')
  revalidatePath('/partner/dashboard')
  revalidatePath('/admin/creatives-review')
  revalidatePath('/admin/campaigns')
  return { error: null }
}

function parseCreativeUrls(value: string) {
  return splitList(value).filter((item) => item.length > 0)
}

function splitList(value: string) {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function hasMinimumDuration(startDate: string, endDate: string) {
  return endDate >= addMonths(startDate, MIN_CAMPAIGN_MONTHS)
}

function countBillingMonths(startDate: string, endDate: string) {
  let cursor = startDate
  let months = 0
  while (cursor < endDate && months < 120) {
    months += 1
    cursor = addMonths(cursor, 1)
  }
  return Math.max(MIN_CAMPAIGN_MONTHS, months)
}

function addMonths(date: string, months: number) {
  const [year, month, day] = date.split('-').map(Number)
  const d = new Date(Date.UTC(year, month - 1, day))
  const originalDay = d.getUTCDate()
  d.setUTCMonth(d.getUTCMonth() + months)
  if (d.getUTCDate() !== originalDay) d.setUTCDate(0)
  return d.toISOString().slice(0, 10)
}
