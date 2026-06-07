/**
 * Admin bypass feature flag helpers.
 *
 * ADMIN_PANEL_BYPASS env var: when set to "true" in dev, users whose
 * profile.role === "admin" may visit any /driver, /partner, or /garage route
 * without being redirected. Unset this var in production — bypass disappears
 * with zero code change. Never commit it to .env files checked into git.
 *
 * To disable: delete ADMIN_PANEL_BYPASS from Vercel env vars (or .env.local).
 */
import 'server-only'

import type { UserRole } from '@/types/db-aliases'

/**
 * Returns true only when the env var is explicitly "true".
 * Default (unset or any other value) = false.
 */
export const isAdminBypassEnabled = (): boolean => process.env.ADMIN_PANEL_BYPASS === 'true'

/**
 * Returns true when ALL conditions hold:
 *   1. Bypass flag is on.
 *   2. The calling user's profile role is "admin".
 *   3. The target panel role is NOT "admin" (admin-to-admin = no bypass needed).
 *   4. requiredRole is non-null (unprotected paths don't use bypass).
 */
export const canAdminBypassPath = (
  profileRole: UserRole | null,
  requiredRole: Exclude<UserRole, 'pending'> | null,
): boolean =>
  isAdminBypassEnabled() &&
  profileRole === 'admin' &&
  requiredRole !== null &&
  requiredRole !== 'admin'
