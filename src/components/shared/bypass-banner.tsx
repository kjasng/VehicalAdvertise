/**
 * BypassBanner — server component.
 *
 * Rendered by role-panel layouts (driver, partner, garage) when an admin is
 * viewing that panel via the ADMIN_PANEL_BYPASS dev flag. Renders nothing in
 * production (env var unset) or when the user is in their own panel.
 *
 * Phase 02 (RoleShell) wires this into every role layout automatically.
 * Until then, layouts can import and render it directly.
 */
import Link from 'next/link'

import { getEffectiveProfileAndPanel } from '@/lib/auth/role-gate'

interface BypassBannerProps {
  /** Absolute pathname of the current page (e.g. "/driver/dashboard"). */
  pathname: string
}

export default async function BypassBanner({ pathname }: BypassBannerProps) {
  const { profileRole, panelRole, bypassActive } = await getEffectiveProfileAndPanel(pathname)

  // Only render when an admin is actively impersonating a different panel.
  if (!bypassActive || profileRole === panelRole) return null

  const panelLabel = (panelRole ?? '').toUpperCase()

  return (
    <div
      className="bg-primary text-primary-foreground sticky top-0 z-50 flex h-[44px] w-full items-center justify-between px-6"
      role="status"
      aria-label="Admin bypass active"
    >
      {/* Left: kicker + message */}
      <p className="flex items-center gap-2 text-[11px] font-bold tracking-[2.5px] uppercase">
        <span>ADMIN BYPASS</span>
        <span className="opacity-50">·</span>
        <span>
          VIEWING AS <span className="font-heading text-[13px] tracking-[1.5px]">{panelLabel}</span>
        </span>
        <span className="opacity-50">·</span>
        <span className="font-normal tracking-normal normal-case opacity-75">
          this only works in dev
        </span>
      </p>

      {/* Right: back-to-admin link */}
      <Link
        href="/admin/dashboard"
        className="text-[11px] font-bold tracking-[2px] uppercase underline-offset-2 hover:underline"
      >
        Back to admin →
      </Link>
    </div>
  )
}
