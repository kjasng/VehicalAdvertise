/**
 * Driver bottom-nav configuration.
 * 4-tab mobile PWA navigation for the driver role panel.
 */
import { Home, Receipt, ShieldCheck, User } from 'lucide-react'

import type { BottomNavItem } from '@/components/shared/role-bottom-nav'

export const DRIVER_NAV: BottomNavItem[] = [
  { href: '/driver/dashboard', label: 'HOME', icon: Home },
  { href: '/driver/verify', label: 'VERIFY', icon: ShieldCheck },
  { href: '/driver/invoice', label: 'INVOICE', icon: Receipt },
  { href: '/driver/profile', label: 'PROFILE', icon: User },
]
