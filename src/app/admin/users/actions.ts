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

const MANAGED_USER_ROLES = ['driver', 'partner', 'garage'] as const
const EDITABLE_USER_ROLES = ['driver', 'partner', 'garage', 'admin'] as const

// 'admin' is intentionally excluded — use a separate explicit promote flow to
// prevent accidental privilege escalation via this general-purpose action.
const RoleSchema = z.object({
  targetId: z.string().uuid(),
  role: z.enum(MANAGED_USER_ROLES),
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

  if (target?.role === 'admin') {
    const { count, error: countError } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'admin')

    if (countError) return { error: countError.message }
    if ((count ?? 0) <= 1) return { error: 'Cannot delete the last admin account' }
  }

  // Atomically purge the user's owned data (contracts, ledger, payouts, invoices,
  // campaigns, vehicles) in dependency order. Several of these FKs are NOT NULL /
  // NOACTION and would otherwise block the auth.users -> profiles cascade. See
  // migration 0025. Reviewer/actor refs are handled separately by ON DELETE SET
  // NULL (migrations 0022–0024).
  const { error: purgeError } = await supabase.rpc('admin_purge_user_data', { p_user: targetId })
  if (purgeError) return { error: purgeError.message }

  // Delete auth user — cascades to profiles and the role sub-row (drivers/partners/garages).
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

// ── Create user ────────────────────────────────────────────────────────────

const BODY_TYPES = ['sedan', 'suv', 'hatchback', 'mpv', 'pickup'] as const

const CreateUserSchema = z.object({
  email: z.string().email('Invalid email'),
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(MANAGED_USER_ROLES),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  bodyType: z.enum(BODY_TYPES).optional(),
})

export async function createUser(raw: unknown): Promise<{ error: string | null }> {
  const parsed = CreateUserSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  const { email, fullName, role, password, bodyType } = parsed.data

  const callerRole = await getCurrentUserRole()
  if (callerRole !== 'admin') return { error: 'Forbidden' }

  const supabase = createSupabaseAdminClient()

  const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  })
  if (authErr) return { error: authErr.message }

  // Trigger creates profile as 'pending' — update to chosen role + name
  const { error: roleErr } = await supabase
    .from('profiles')
    .update({ role, full_name: fullName })
    .eq('id', authData.user.id)
  if (roleErr) return { error: roleErr.message }

  // For drivers, seed the drivers row (with body_type if provided)
  if (role === 'driver') {
    const { error: driverErr } = await supabase
      .from('drivers')
      .upsert({ id: authData.user.id, body_type: bodyType ?? null }, { onConflict: 'id' })
    if (driverErr) return { error: driverErr.message }
  }

  revalidatePath('/admin/users')
  return { error: null }
}

// ── Fetch KYC photos for a driver (signed URLs, 15 min TTL) ──────────────

export async function fetchUserKycPhotos(userId: string): Promise<{
  front: string | null
  back: string | null
  selfie: string | null
}> {
  const callerRole = await getCurrentUserRole()
  if (callerRole !== 'admin') return { front: null, back: null, selfie: null }

  const supabase = createSupabaseAdminClient()
  const { data: photos } = await supabase
    .from('photos')
    .select('kind, storage_path')
    .eq('subject_id', userId)
    .in('kind', ['kyc_cccd_front', 'kyc_cccd_back', 'kyc_selfie'])

  if (!photos?.length) return { front: null, back: null, selfie: null }

  const { data: signed } = await supabase.storage.from('driver-kyc').createSignedUrls(
    photos.map((p) => p.storage_path),
    900,
  )

  const urlByPath = Object.fromEntries(
    (signed ?? []).filter((s) => s.signedUrl).map((s) => [s.path, s.signedUrl]),
  )
  const byKind = Object.fromEntries(photos.map((p) => [p.kind, urlByPath[p.storage_path] ?? null]))

  return {
    front: byKind['kyc_cccd_front'] ?? null,
    back: byKind['kyc_cccd_back'] ?? null,
    selfie: byKind['kyc_selfie'] ?? null,
  }
}

// ── Update user (name + role + phone) ─────────────────────────────────────

const UpdateUserSchema = z.object({
  targetId: z.string().uuid(),
  email: z.string().trim().email('Invalid email'),
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone: z.string().max(20).optional(),
  role: z.enum(EDITABLE_USER_ROLES),
  password: z.preprocess(
    (value) => (typeof value === 'string' && value.length === 0 ? undefined : value),
    z.string().min(8, 'Password must be at least 8 characters').optional(),
  ),
  bodyType: z.enum(BODY_TYPES).optional(),
})

export async function updateUser(raw: unknown): Promise<{ error: string | null }> {
  const parsed = UpdateUserSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  const { targetId, email, fullName, phone, role, password, bodyType } = parsed.data

  const callerRole = await getCurrentUserRole()
  if (callerRole !== 'admin') return { error: 'Forbidden' }

  const supabase = createSupabaseAdminClient()
  const { data: previous, error: previousError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', targetId)
    .single()

  if (previousError) return { error: previousError.message }
  if (previous.role === 'admin' && role !== 'admin') {
    return { error: 'Admin role cannot be changed here' }
  }
  if (previous.role !== 'admin' && role === 'admin') {
    return { error: 'Admin promotion requires a dedicated flow' }
  }

  const authUpdate: {
    email: string
    password?: string
    user_metadata: { full_name: string }
  } = {
    email,
    user_metadata: { full_name: fullName },
  }
  if (password) authUpdate.password = password

  const { error: authError } = await supabase.auth.admin.updateUserById(targetId, authUpdate)
  if (authError) return { error: authError.message }

  const { error } = await supabase
    .from('profiles')
    .update({ email, full_name: fullName, role, phone_e164: phone ?? null })
    .eq('id', targetId)
  if (error) return { error: error.message }

  // For drivers, upsert body_type onto the drivers row
  if (role === 'driver' && bodyType) {
    const { error: driverErr } = await supabase
      .from('drivers')
      .upsert({ id: targetId, body_type: bodyType }, { onConflict: 'id' })
    if (driverErr) return { error: driverErr.message }
  }

  revalidatePath('/admin/users')
  return { error: null }
}

// ── Bulk actions ───────────────────────────────────────────────────────────

const BulkIdsSchema = z.object({ ids: z.array(z.string().uuid()).min(1) })

export async function bulkDeleteUsers(
  raw: unknown,
): Promise<{ error: string | null; count: number }> {
  const parsed = BulkIdsSchema.safeParse(raw)
  if (!parsed.success) return { error: 'Invalid input', count: 0 }

  const callerRole = await getCurrentUserRole()
  if (callerRole !== 'admin') return { error: 'Forbidden', count: 0 }

  const serverClient = await createSupabaseServerClient()
  const {
    data: { user },
  } = await serverClient.auth.getUser()
  if (!user) return { error: 'Not authenticated', count: 0 }

  const supabase = createSupabaseAdminClient()
  const ids = parsed.data.ids.filter((id) => id !== user.id)
  if (ids.length === 0) return { error: 'Cannot delete your own account', count: 0 }

  const { data: targets, error: targetsError } = await supabase
    .from('profiles')
    .select('id, role')
    .in('id', ids)
  if (targetsError) return { error: targetsError.message, count: 0 }

  const { count: initialAdminCount, error: adminCountError } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('role', 'admin')
  if (adminCountError) return { error: adminCountError.message, count: 0 }

  let adminCount = initialAdminCount ?? 0
  let count = 0
  for (const target of targets ?? []) {
    if (target.role === 'admin' && adminCount <= 1) continue

    const { error: purgeError } = await supabase.rpc('admin_purge_user_data', {
      p_user: target.id,
    })
    if (purgeError) return { error: purgeError.message, count }

    const { error } = await supabase.auth.admin.deleteUser(target.id)
    if (!error) {
      count++
      if (target.role === 'admin') adminCount--
    }
  }
  revalidatePath('/admin/users')
  return { error: null, count }
}

export async function bulkSetUsersBlocked(
  raw: unknown,
): Promise<{ error: string | null; count: number }> {
  const parsed = BulkIdsSchema.merge(z.object({ blocked: z.boolean() })).safeParse(raw)
  if (!parsed.success) return { error: 'Invalid input', count: 0 }

  const callerRole = await getCurrentUserRole()
  if (callerRole !== 'admin') return { error: 'Forbidden', count: 0 }

  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('profiles')
    .update({ blocked: parsed.data.blocked })
    .in('id', parsed.data.ids)
    .select('id')

  if (error) return { error: error.message, count: 0 }
  revalidatePath('/admin/users')
  return { error: null, count: data?.length ?? parsed.data.ids.length }
}

export async function bulkChangeRole(
  raw: unknown,
): Promise<{ error: string | null; count: number }> {
  const parsed = BulkIdsSchema.merge(z.object({ role: z.enum(MANAGED_USER_ROLES) })).safeParse(raw)
  if (!parsed.success) return { error: 'Invalid input', count: 0 }

  const callerRole = await getCurrentUserRole()
  if (callerRole !== 'admin') return { error: 'Forbidden', count: 0 }

  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('profiles')
    .update({ role: parsed.data.role })
    .in('id', parsed.data.ids)
    .not('role', 'eq', 'admin')
    .select('id')

  if (error) return { error: error.message, count: 0 }
  revalidatePath('/admin/users')
  return { error: null, count: data?.length ?? parsed.data.ids.length }
}
