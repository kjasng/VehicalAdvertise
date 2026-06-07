/**
 * Partner sidebar navigation configuration.
 * Flat partner navigation. Creatives are uploaded inside each campaign.
 */
import { LayoutDashboard, Megaphone, Receipt, Wallet } from 'lucide-react'

import type { NavItem } from '@/components/shared/role-sidebar'

export const PARTNER_NAV: NavItem[] = [
  { href: '/partner/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/partner/campaigns', label: 'Campaigns', icon: Megaphone },
  { href: '/partner/billing', label: 'Plan', icon: Wallet },
  { href: '/partner/invoices', label: 'Invoices', icon: Receipt },
]
