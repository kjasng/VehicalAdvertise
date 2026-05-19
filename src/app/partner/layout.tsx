import { SidebarNav, type NavItem } from '@/components/shared/role-nav'

const NAV: NavItem[] = [
  { href: '/partner/dashboard', label: 'Dashboard' },
  { href: '/partner/campaigns', label: 'Campaigns' },
  { href: '/partner/creatives', label: 'Creatives' },
  { href: '/partner/billing', label: 'Billing' },
]

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <SidebarNav title="Wheels Earner · Partner" items={NAV} />
      <section className="flex-1 p-6">{children}</section>
    </div>
  )
}
