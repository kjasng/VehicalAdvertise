'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { getCurrentUserRole } from '@/lib/auth/role-gate'
import {
  DEFAULT_CAMPAIGN_PLAN,
  DRIVER_NET_MONTHLY_VND,
  MIN_CAMPAIGN_MONTHS,
  calculateCampaignBudgetReserveVnd,
  calculateDriverMonthlyBudgetVnd,
  formatVnd,
} from '@/lib/partner/constants'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const CampaignSchema = z.object({
  name: z.string().trim().min(3, 'Campaign name must be at least 3 characters'),
  description: z.string().trim().min(10, 'Description must be at least 10 characters'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date is required'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date is required'),
  creativeUrls: z.string().trim().min(1, 'Upload or enter at least one creative URL'),
  planPackage: z.literal(DEFAULT_CAMPAIGN_PLAN.package),
  driverCount: z.literal(DEFAULT_CAMPAIGN_PLAN.driverCount),
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

  const durationMonths = DEFAULT_CAMPAIGN_PLAN.durationMonths
  const effectiveEndDate = addMonths(data.startDate, durationMonths)

  if (!hasMinimumDuration(data.startDate, effectiveEndDate)) {
    return { error: 'Chiến dịch phải kéo dài tối thiểu 3 tháng.' }
  }

  const requiredMonthlyBudget = calculateDriverMonthlyBudgetVnd(DEFAULT_CAMPAIGN_PLAN.driverCount)

  const supabase = createSupabaseAdminClient()
  const { data: partner } = await supabase
    .from('partners')
    .select('balance_vnd, status')
    .eq('id', user.id)
    .maybeSingle()

  if (partner?.status !== 'approved') return { error: 'Partner account is not active yet.' }

  const campaignBudgetVnd = calculateCampaignBudgetReserveVnd({
    driverCount: DEFAULT_CAMPAIGN_PLAN.driverCount,
    durationMonths,
  })

  if ((partner.balance_vnd ?? 0) < campaignBudgetVnd) {
    return {
      error: `Số dư hiện tại không đủ để reserve campaign budget. Yêu cầu: ${formatVnd(campaignBudgetVnd)}. Hiện có: ${formatVnd(partner.balance_vnd ?? 0)}.`,
    }
  }

  const { data: campaignId, error } = await supabase.rpc('partner_create_campaign_with_reserve', {
    p_partner_id: user.id,
    p_name: data.name,
    p_brief: data.description,
    p_creative_url: creativeUrls[0],
    p_creative_urls: creativeUrls,
    p_qr_target_url: data.qrTargetUrl,
    p_budget_vnd: campaignBudgetVnd,
    p_start_date: data.startDate,
    p_end_date: effectiveEndDate,
    p_monthly_budget_vnd: requiredMonthlyBudget,
    p_driver_net_monthly_vnd: DRIVER_NET_MONTHLY_VND,
    p_active_driver_limit: DEFAULT_CAMPAIGN_PLAN.driverCount,
    p_requested_driver_count: DEFAULT_CAMPAIGN_PLAN.driverCount,
  })

  if (error) {
    if (error.message.includes('partner balance is insufficient')) {
      return { error: 'Số dư không đủ. Refresh và thử lại.' }
    }
    return { error: error.message }
  }

  if (!campaignId) return { error: 'Campaign reserve succeeded but campaign id was not returned.' }

  revalidatePath('/partner/campaigns')
  revalidatePath('/partner/dashboard')
  revalidatePath('/partner/billing')
  revalidatePath('/partner/invoices')
  revalidatePath('/admin/campaigns')
  revalidatePath('/admin/contracts')
  revalidatePath('/admin/partner-balances')
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

function addMonths(date: string, months: number) {
  const [year, month, day] = date.split('-').map(Number)
  const d = new Date(Date.UTC(year, month - 1, day))
  const originalDay = d.getUTCDate()
  d.setUTCMonth(d.getUTCMonth() + months)
  if (d.getUTCDate() !== originalDay) d.setUTCDate(0)
  return d.toISOString().slice(0, 10)
}

// ── Creative upload ────────────────────────────────────────────────────────

const CREATIVES_BUCKET = 'campaign-creatives'
const MAX_CREATIVE_SIZE = 8 * 1024 * 1024 // 8MB

/**
 * Uploads a single creative image to Supabase Storage under the partner's own
 * folder and returns its public URL. The UI collects these URLs and submits
 * them via createPartnerCampaign's creativeUrls field (one per line).
 */
export async function uploadCampaignCreative(
  formData: FormData,
): Promise<{ url: string | null; error: string | null }> {
  const role = await getCurrentUserRole()
  if (role !== 'partner') return { url: null, error: 'Forbidden' }

  const serverClient = await createSupabaseServerClient()
  const {
    data: { user },
  } = await serverClient.auth.getUser()
  if (!user) return { url: null, error: 'Not authenticated' }

  const file = formData.get('file')
  if (!(file instanceof File) || file.size === 0) return { url: null, error: 'No file provided' }
  if (!file.type.startsWith('image/')) return { url: null, error: 'Creative must be an image file' }
  if (file.size > MAX_CREATIVE_SIZE) return { url: null, error: 'Image must be smaller than 8MB' }

  const ext = (file.name.split('.').pop() || 'png').toLowerCase().replace(/[^a-z0-9]/g, '')
  const path = `${user.id}/${crypto.randomUUID()}.${ext}`
  const body = Buffer.from(await file.arrayBuffer())

  const supabase = createSupabaseAdminClient()
  const { error: uploadError } = await supabase.storage.from(CREATIVES_BUCKET).upload(path, body, {
    contentType: file.type,
    upsert: false,
  })
  if (uploadError) return { url: null, error: uploadError.message }

  const { data } = supabase.storage.from(CREATIVES_BUCKET).getPublicUrl(path)
  return { url: data.publicUrl, error: null }
}
