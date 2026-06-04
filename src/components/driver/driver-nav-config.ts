/**
 * Driver sidebar navigation configuration.
 * Driver sidebar navigation configuration.
 */
import { Home, Receipt, ShieldCheck, User, Wrench } from 'lucide-react'

import type { NavItem } from '@/components/shared/role-sidebar'

export const DRIVER_NAV: NavItem[] = [
  { href: '/driver/dashboard', label: 'Dashboard', icon: Home },
  { href: '/driver/verify', label: 'Verify', icon: ShieldCheck },
  { href: '/driver/garage', label: 'Garage', icon: Wrench },
  { href: '/driver/invoice', label: 'Invoice', icon: Receipt },
  { href: '/driver/profile', label: 'Profile', icon: User },
]
