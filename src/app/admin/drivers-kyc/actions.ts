'use server'

import { z } from 'zod'

import { getCurrentUserRole } from '@/lib/auth/role-gate'

const ReviewSchema = z
  .object({
    driverId: z.string().uuid(),
    decision: z.enum(['approved', 'rejected']),
    reason: z.string().max(500).optional(),
  })
  .refine((d) => d.decision !== 'rejected' || (d.reason && d.reason.trim().length > 0), {
    message: 'Rejection reason required',
    path: ['reason'],
  })

export async function reviewDriverKyc(raw: unknown): Promise<{ error: string | null }> {
  const parsed = ReviewSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }

  // In-action role check — layout guard does not run on direct action POST
  const role = await getCurrentUserRole()
  if (role !== 'admin') return { error: 'Forbidden' }

  // Manual driver-KYC review has been removed — KYC is auto-approved on submit.
  // The approve_driver_kyc RPC was dropped in migration 0044; this action is a
  // no-op kept only until the admin route is deleted.
  return { error: 'Manual KYC review has been removed — drivers are auto-approved on submit.' }
}
