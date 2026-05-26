/**
 * Garage sidebar navigation configuration.
 */
import { Camera, LayoutDashboard, Wallet, Wrench } from 'lucide-react'

import type { NavItem } from '@/components/shared/role-sidebar'

export const GARAGE_NAV: NavItem[] = [
  { href: '/garage/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/garage/installs', label: 'Installs', icon: Wrench },
  { href: '/garage/proof-upload', label: 'Proof Upload', icon: Camera },
  { href: '/garage/payout', label: 'Payout', icon: Wallet },
]
