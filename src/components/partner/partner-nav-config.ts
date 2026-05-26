/**
 * Partner sidebar navigation configuration.
 * 4 items: Dashboard / Campaigns / Creatives / Billing
 */
import { Image, LayoutDashboard, Megaphone, Wallet } from 'lucide-react'

import type { NavItem } from '@/components/shared/role-sidebar'

export const PARTNER_NAV: NavItem[] = [
  { href: '/partner/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/partner/campaigns', label: 'Campaigns', icon: Megaphone },
  { href: '/partner/creatives', label: 'Creatives', icon: Image },
  { href: '/partner/billing', label: 'Billing', icon: Wallet },
]
