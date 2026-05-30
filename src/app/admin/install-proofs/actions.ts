'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { getCurrentUserRole } from '@/lib/auth/role-gate'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const ReviewSchema = z
  .object({
    photoId: z.string().uuid(),
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
  const { photoId, decision, reason } = parsed.data

  const role = await getCurrentUserRole()
  if (role !== 'admin') return { error: 'Forbidden' }

  // Resolve caller uid for audit_log (service-role client has no session)
  const serverClient = await createSupabaseServerClient()
  const {
    data: { user },
  } = await serverClient.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const supabase = createSupabaseAdminClient()

  // photos.status is not column-revoked — direct service-role update is safe
  const { error: updateError } = await supabase
    .from('photos')
    .update({
      status: decision,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      reject_reason: decision === 'rejected' ? (reason ?? null) : null,
    })
    .eq('id', photoId)

  if (updateError) return { error: updateError.message }

  const { error: auditError } = await supabase.from('audit_log').insert({
    actor_id: user.id,
    action: `install_proof_${decision}`,
    entity_type: 'photos',
    entity_id: photoId,
    diff: { reason: reason ?? null },
  })
  if (auditError) console.error('[reviewInstallProof] audit_log insert failed:', auditError.message)

  revalidatePath('/admin/install-proofs')
  return { error: null }
}
