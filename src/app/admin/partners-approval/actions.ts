'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { sendPartnerApproved, sendPartnerRejected } from '@/lib/email/send-notifications'
import { getCurrentUserRole } from '@/lib/auth/role-gate'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

const RejectSchema = z.object({
  partnerId: z.string().uuid(),
  reason: z.string().min(5, 'Please provide a reason (min 5 characters)').max(500),
})

export async function approvePartner(raw: unknown): Promise<{ error: string | null }> {
  const parsed = z.object({ partnerId: z.string().uuid() }).safeParse(raw)
  if (!parsed.success) return { error: 'Invalid input' }
  const { partnerId } = parsed.data

  const role = await getCurrentUserRole()
  if (role !== 'admin') return { error: 'Forbidden' }

  const supabase = createSupabaseAdminClient()

  const { error } = await supabase
    .from('partners')
    .update({ status: 'approved', approved_at: new Date().toISOString(), reject_reason: null })
    .eq('id', partnerId)
    .eq('status', 'pending')

  if (error) return { error: error.message }

  // Fire-and-forget email
  const { data: profile } = await supabase
    .from('profiles')
    .select('email, full_name')
    .eq('id', partnerId)
    .single()

  if (profile?.email) {
    sendPartnerApproved({ email: profile.email, name: profile.full_name }).catch(() => {})
  }

  revalidatePath('/admin/partners-approval')
  return { error: null }
}

export async function rejectPartner(raw: unknown): Promise<{ error: string | null }> {
  const parsed = RejectSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  const { partnerId, reason } = parsed.data

  const role = await getCurrentUserRole()
  if (role !== 'admin') return { error: 'Forbidden' }

  const supabase = createSupabaseAdminClient()

  const { error } = await supabase
    .from('partners')
    .update({ status: 'rejected', reject_reason: reason })
    .eq('id', partnerId)
    .eq('status', 'pending')

  if (error) return { error: error.message }

  const { data: profile } = await supabase
    .from('profiles')
    .select('email, full_name')
    .eq('id', partnerId)
    .single()

  if (profile?.email) {
    sendPartnerRejected({ email: profile.email, name: profile.full_name, reason }).catch(() => {})
  }

  revalidatePath('/admin/partners-approval')
  return { error: null }
}
