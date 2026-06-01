/**
 * Admin sidebar navigation.
 * Items with `children` render as always-expanded groups with indented sub-links.
 */
import {
  LayoutDashboard,
  UserCheck,
  Image,
  Wrench,
  Camera,
  ShieldCheck,
  Megaphone,
  FileText,
  Receipt,
  Wallet,
  Users,
  BarChart2,
  Map,
  ScrollText,
} from 'lucide-react'

import type { NavItem } from '@/components/shared/role-sidebar'

export const ADMIN_NAV: NavItem[] = [
  // ── Operations ────────────────────────────────────────────────
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },

  // Verification group (KYC + creative + install + photo)
  {
    label: 'Verification',
    icon: ShieldCheck,
    children: [
      { href: '/admin/drivers-kyc', label: 'Drivers KYC', icon: UserCheck },
      { href: '/admin/creatives-review', label: 'Creatives', icon: Image },
      { href: '/admin/install-proofs', label: 'Install Proofs', icon: Wrench },
      { href: '/admin/photo-verifications', label: 'Photo Checks', icon: Camera },
    ],
  },

  { href: '/admin/campaigns', label: 'Campaigns', icon: Megaphone },

  // ── Money ─────────────────────────────────────────────────────
  { href: '/admin/payouts', label: 'Payouts', icon: Wallet },

  // Invoices group
  {
    label: 'Invoices',
    icon: Receipt,
    children: [
      { href: '/admin/invoices/driver', label: 'Driver', icon: FileText },
      { href: '/admin/invoices/partner', label: 'Partner', icon: FileText },
      { href: '/admin/invoices/garage', label: 'Garage', icon: FileText },
    ],
  },

  // ── System ────────────────────────────────────────────────────
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/reports', label: 'Reports', icon: BarChart2 },
  { href: '/admin/audit-log', label: 'Audit Log', icon: ScrollText },
  { href: '/admin/map', label: 'Map', icon: Map },
]
