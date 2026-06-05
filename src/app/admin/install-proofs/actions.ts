'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { getCurrentUserRole } from '@/lib/auth/role-gate'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const ReviewSchema = z
  .object({
    contractId: z.string().uuid(),
    decision: z.enum(['approved', 'rejected']),
    reason: z.string().max(500).optional(),
  })
  .refine((d) => d.decision !== 'rejected' || (d.reason && d.reason.trim().length > 0), {
    message: 'Rejection reason required',
    path: ['reason'],
  })

export async function reviewInstallProof(raw: unknown): Promise<{ error: string | null }> {
  const parsed = ReviewSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  const { contractId, decision, reason } = parsed.data

  const role = await getCurrentUserRole()
  if (role !== 'admin') return { error: 'Forbidden' }

  // Resolve caller uid for audit_log (service-role client has no session)
  const serverClient = await createSupabaseServerClient()
  const {
    data: { user },
  } = await serverClient.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const supabase = createSupabaseAdminClient()
  const { data: contract } = await supabase
    .from('contracts')
    .select('id, campaign_id')
    .eq('id', contractId)
    .maybeSingle()
  if (!contract) return { error: 'Install job not found' }

  const { data: photos, error: photosError } = await supabase
    .from('photos')
    .select('id, status')
    .eq('subject_id', contractId)
    .eq('subject_type', 'contract')
    .eq('kind', 'install_proof')
    .order('created_at', { ascending: false })
    .limit(4)

  if (photosError) return { error: photosError.message }
  if ((photos ?? []).length !== 4) return { error: 'Install proof phải có đủ 4 ảnh.' }
  if ((photos ?? []).some((photo) => photo.status !== 'pending')) {
    return { error: 'Install proof batch này đã được review.' }
  }
  const anchorPhoto = photos?.[0]
  if (!anchorPhoto) return { error: 'Install proof not found.' }

  const { error: reviewError } = await supabase.rpc('admin_review_install_proof', {
    p_actor_id: user.id,
    p_photo_id: anchorPhoto.id,
    p_decision: decision,
    p_reason: reason ?? null,
  })
  if (reviewError) return { error: reviewError.message }

  revalidatePath('/admin/install-proofs')
  revalidatePath('/admin/campaigns')
  revalidatePath('/admin/contracts')
  revalidatePath(`/admin/contracts/${contract.campaign_id}`)
  revalidatePath('/admin/invoices/garage')
  revalidatePath('/garage/dashboard')
  revalidatePath('/garage/installs')
  revalidatePath('/garage/payout')
  revalidatePath('/driver/invoice')
  return { error: null }
}
