/**
 * Admin sidebar navigation configuration.
 * Groups: Operations · Money · System
 */
import {
  LayoutDashboard,
  UserCheck,
  Image,
  Wrench,
  Camera,
  FileText,
  Receipt,
  Users,
  BarChart2,
  Map,
} from 'lucide-react'

import type { NavItem } from '@/components/shared/role-sidebar'

export const ADMIN_NAV: NavItem[] = [
  // Operations group
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/drivers-kyc', label: 'Drivers KYC', icon: UserCheck },
  { href: '/admin/creatives-review', label: 'Creatives Review', icon: Image },
  { href: '/admin/install-proofs', label: 'Install Proofs', icon: Wrench },
  { href: '/admin/photo-verifications', label: 'Photo Verifications', icon: Camera },
  // Money group
  { href: '/admin/invoices/driver', label: 'Driver Invoices', icon: FileText },
  { href: '/admin/invoices/partner', label: 'Partner Invoices', icon: Receipt },
  { href: '/admin/invoices/garage', label: 'Garage Invoices', icon: FileText },
  // System group
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/reports', label: 'Reports', icon: BarChart2 },
  { href: '/admin/map', label: 'Map', icon: Map },
]
