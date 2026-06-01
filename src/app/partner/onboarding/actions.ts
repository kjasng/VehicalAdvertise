'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const ProfileSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters').max(200),
  taxCode: z.string().min(10, 'Tax code must be 10-13 digits').max(13),
  billingAddress: z.string().min(10, 'Please enter a full billing address').max(500),
})

export async function submitPartnerProfile(raw: unknown): Promise<{ error: string | null }> {
  const parsed = ProfileSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  const { companyName, taxCode, billingAddress } = parsed.data

  const serverClient = await createSupabaseServerClient()
  const {
    data: { user },
  } = await serverClient.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const supabase = createSupabaseAdminClient()

  // Upsert partners row — set status back to 'pending' if resubmitting after rejection
  const { error } = await supabase.from('partners').upsert(
    {
      id: user.id,
      company_name: companyName,
      tax_code: taxCode,
      billing_address: billingAddress,
      status: 'pending',
      reject_reason: null,
    },
    { onConflict: 'id' },
  )

  if (error) return { error: error.message }

  revalidatePath('/partner/onboarding')
  return { error: null }
}
