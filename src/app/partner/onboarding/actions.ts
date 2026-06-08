'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const VN_PHONE_RE = /^(0[35789])\d{8}$/

const ProfileSchema = z.object({
  companyName: z.string().trim().min(2, 'Tên công ty phải có ít nhất 2 ký tự').max(200),
  taxCode: z
    .string()
    .trim()
    .regex(/^\d{10,13}$/, 'Mã số thuế phải có 10-13 chữ số'),
  billingAddress: z.string().trim().min(10, 'Vui lòng nhập địa chỉ đầy đủ').max(500),
  contactName: z.string().trim().min(2, 'Tên người liên hệ phải có ít nhất 2 ký tự').max(100),
  contactPhone: z.string().trim().regex(VN_PHONE_RE, 'Số điện thoại không hợp lệ (VD: 0912345678)'),
})

export async function submitPartnerProfile(raw: unknown): Promise<{ error: string | null }> {
  const parsed = ProfileSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  const { companyName, taxCode, billingAddress, contactName, contactPhone } = parsed.data

  const serverClient = await createSupabaseServerClient()
  const {
    data: { user },
  } = await serverClient.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const supabase = createSupabaseAdminClient()

  const { data: profile, error: roleError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()
  if (roleError) return { error: roleError.message }
  if (profile?.role !== 'partner') return { error: 'Forbidden' }

  const { error: profileErr } = await supabase
    .from('profiles')
    .update({ full_name: contactName, phone_e164: contactPhone })
    .eq('id', user.id)
    .eq('role', 'partner')
  if (profileErr) {
    if (profileErr.code === '23505') return { error: 'Số điện thoại đã được sử dụng' }
    return { error: profileErr.message }
  }

  const { error: partnerErr } = await supabase.from('partners').upsert(
    {
      id: user.id,
      company_name: companyName,
      tax_code: taxCode,
      billing_address: billingAddress,
      status: 'approved',
      approved_at: new Date().toISOString(),
      reject_reason: null,
    },
    { onConflict: 'id' },
  )
  if (partnerErr) return { error: partnerErr.message }

  revalidatePath('/partner/onboarding')
  revalidatePath('/partner/dashboard')
  revalidatePath('/partner/campaigns')
  revalidatePath('/partner/billing')
  revalidatePath('/partner/invoices')
  redirect('/partner/dashboard')
}
