/**
 * Driver sidebar navigation configuration.
 * Driver sidebar navigation configuration.
 */
import { Receipt, ShieldCheck, User, Wrench } from 'lucide-react'

import type { NavItem } from '@/components/shared/role-sidebar'

export const DRIVER_NAV: NavItem[] = [
  { href: '/driver/verify', label: 'Verify', icon: ShieldCheck },
  { href: '/driver/garage', label: 'Garage', icon: Wrench },
  { href: '/driver/invoice', label: 'Invoice', icon: Receipt },
  { href: '/driver/profile', label: 'Profile', icon: User },
]
