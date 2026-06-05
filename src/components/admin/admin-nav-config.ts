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
  Building2,
  ShieldCheck,
  FileText,
  GitMerge,
  Receipt,
  Landmark,
  Scale,
  SlidersHorizontal,
  Users,
  BarChart2,
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
      { href: '/admin/partners-approval', label: 'Partners', icon: Building2 },
      { href: '/admin/creatives-review', label: 'Creatives', icon: Image },
      { href: '/admin/install-proofs', label: 'Install Proofs', icon: Wrench },
      { href: '/admin/photo-verifications', label: 'Photo Checks', icon: Camera },
    ],
  },

  // Invoices group
  {
    label: 'Invoices',
    icon: Receipt,
    children: [
      { href: '/admin/invoices/driver', label: 'Driver', icon: FileText },
      { href: '/admin/invoices/partner', label: 'Partner', icon: FileText },
      { href: '/admin/invoices/garage', label: 'Garage', icon: FileText },
      { href: '/admin/reports', label: 'Reports', icon: BarChart2 },
    ],
  },
  { href: '/admin/contracts', label: 'Campaigns', icon: GitMerge },

  // ── Money ─────────────────────────────────────────────────────
  { href: '/admin/partner-balances', label: 'Partner Balances', icon: Landmark },
  { href: '/admin/ledger-adjustments', label: 'Ledger Adjustments', icon: Scale },
  { href: '/admin/pricing-settings', label: 'Settings', icon: SlidersHorizontal },

  // ── System ────────────────────────────────────────────────────
  { href: '/admin/users', label: 'Users', icon: Users },
]
