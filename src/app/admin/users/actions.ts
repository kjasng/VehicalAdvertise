'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { getCurrentUserRole } from '@/lib/auth/role-gate'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const BlockSchema = z.object({
  targetId: z.string().uuid(),
  blocked: z.boolean(),
})

// 'admin' is intentionally excluded — use a separate explicit promote flow to
// prevent accidental privilege escalation via this general-purpose action.
const RoleSchema = z.object({
  targetId: z.string().uuid(),
  role: z.enum(['driver', 'partner', 'garage']),
})

export async function setUserBlocked(raw: unknown): Promise<{ error: string | null }> {
  const parsed = BlockSchema.safeParse(raw)
  if (!parsed.success) return { error: 'Invalid input' }
  const { targetId, blocked } = parsed.data

  const role = await getCurrentUserRole()
  if (role !== 'admin') return { error: 'Forbidden' }

  // RPC must run under the user JWT so auth.uid() works inside the security-definer function.
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.rpc('set_user_blocked', {
    p_target_id: targetId,
    p_blocked: blocked,
  })
  if (error) return { error: error.message }

  revalidatePath('/admin/users')
  return { error: null }
}

export async function deleteUser(raw: unknown): Promise<{ error: string | null }> {
  const parsed = z.object({ targetId: z.string().uuid() }).safeParse(raw)
  if (!parsed.success) return { error: 'Invalid input' }
  const { targetId } = parsed.data

  const callerRole = await getCurrentUserRole()
  if (callerRole !== 'admin') return { error: 'Forbidden' }

  const serverClient = await createSupabaseServerClient()
  const {
    data: { user },
  } = await serverClient.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  if (targetId === user.id) return { error: 'Cannot delete your own account' }

  const supabase = createSupabaseAdminClient()

  const { data: target } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', targetId)
    .single()

  if (target?.role === 'admin') return { error: 'Cannot delete another admin account' }

  // Delete auth user — cascades to profiles and all child records
  const { error: deleteError } = await supabase.auth.admin.deleteUser(targetId)
  if (deleteError) return { error: deleteError.message }

  const { error: auditError } = await supabase.from('audit_log').insert({
    actor_id: user.id,
    action: 'user_deleted',
    entity_type: 'profiles',
    entity_id: targetId,
    diff: { name: target?.full_name ?? null },
  })
  if (auditError) console.error('[deleteUser] audit_log insert failed:', auditError.message)

  revalidatePath('/admin/users')
  return { error: null }
}

// Role changes are rare and potentially destructive (wrong role locks a user out).
// UI must show explicit confirmation before calling. Admin promotion deliberately
// excluded from this action — requires a dedicated promote flow.
export async function changeUserRole(raw: unknown): Promise<{ error: string | null }> {
  const parsed = RoleSchema.safeParse(raw)
  if (!parsed.success) return { error: 'Invalid input' }
  const { targetId, role: newRole } = parsed.data

  const callerRole = await getCurrentUserRole()
  if (callerRole !== 'admin') return { error: 'Forbidden' }

  // Resolve uid for audit_log (service-role client has no session)
  const serverClient = await createSupabaseServerClient()
  const {
    data: { user },
  } = await serverClient.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const supabase = createSupabaseAdminClient()

  // Fetch previous role for audit diff
  const { data: prev } = await supabase.from('profiles').select('role').eq('id', targetId).single()

  // profiles.role is revoked from authenticated; service-role client bypasses the revoke
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', targetId)

  if (updateError) return { error: updateError.message }

  const { error: auditError } = await supabase.from('audit_log').insert({
    actor_id: user.id,
    action: 'user_role_changed',
    entity_type: 'profiles',
    entity_id: targetId,
    diff: { from: prev?.role ?? null, to: newRole },
  })
  if (auditError) console.error('[changeUserRole] audit_log insert failed:', auditError.message)

  revalidatePath('/admin/users')
  return { error: null }
}
