/**
 * Driver sidebar navigation configuration.
 * 4 items: Dashboard / Verify / Invoice / Profile
 */
import { Home, Receipt, ShieldCheck, User } from 'lucide-react'

import type { NavItem } from '@/components/shared/role-sidebar'

export const DRIVER_NAV: NavItem[] = [
  { href: '/driver/dashboard', label: 'Dashboard', icon: Home },
  { href: '/driver/verify', label: 'Verify', icon: ShieldCheck },
  { href: '/driver/invoice', label: 'Invoice', icon: Receipt },
  { href: '/driver/profile', label: 'Profile', icon: User },
]
