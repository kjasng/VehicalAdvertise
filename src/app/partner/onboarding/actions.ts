'use server'

import { z } from 'zod'

import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const VN_PHONE_RE = /^(0[35789])\d{8}$/

const ProfileSchema = z.object({
  companyName: z.string().min(2, 'Tên công ty phải có ít nhất 2 ký tự').max(200),
  taxCode: z.string().min(10, 'Mã số thuế phải có 10-13 chữ số').max(13),
  billingAddress: z.string().min(10, 'Vui lòng nhập địa chỉ đầy đủ').max(500),
  contactName: z.string().min(2, 'Tên người liên hệ phải có ít nhất 2 ký tự').max(100),
  contactPhone: z.string().regex(VN_PHONE_RE, 'Số điện thoại không hợp lệ (VD: 0912345678)'),
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

  // Auto-approve on submit — manual admin approval removed.
  const { error } = await supabase.from('partners').upsert(
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

  if (error) return { error: error.message }

  // Save contact name + phone to profiles
  const { error: profileErr } = await supabase
    .from('profiles')
    .update({ full_name: contactName, phone_e164: contactPhone })
    .eq('id', user.id)
  if (profileErr) return { error: profileErr.message }

  return { error: null }
}
