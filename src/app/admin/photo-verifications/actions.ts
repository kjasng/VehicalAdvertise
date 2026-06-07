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

export async function reviewPhotoVerif(raw: unknown): Promise<{ error: string | null }> {
  const parsed = ReviewSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  const { photoId, decision, reason } = parsed.data

  const role = await getCurrentUserRole()
  if (role !== 'admin') return { error: 'Forbidden' }

  const serverClient = await createSupabaseServerClient()
  const {
    data: { user },
  } = await serverClient.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const supabase = createSupabaseAdminClient()

  const { data: updated, error: updateError } = await supabase
    .from('photos')
    .update({
      status: decision,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      reject_reason: decision === 'rejected' ? (reason ?? null) : null,
    })
    .eq('id', photoId)
    .eq('status', 'pending') // prevent overwriting an already-reviewed photo
    .select('id')

  if (updateError) return { error: updateError.message }
  if (!updated?.length) return { error: 'Photo already reviewed or not found' }

  revalidatePath('/admin/photo-verifications')
  return { error: null }
}
