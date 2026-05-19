import { SidebarNav, type NavItem } from '@/components/shared/role-nav'

const NAV: NavItem[] = [
  { href: '/garage/dashboard', label: 'Dashboard' },
  { href: '/garage/installs', label: 'Installs' },
  { href: '/garage/proof-upload', label: 'Proof upload' },
  { href: '/garage/payout', label: 'Payout' },
]

export default function GarageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <SidebarNav title="Wheels Earner · Garage" items={NAV} />
      <section className="flex-1 p-6">{children}</section>
    </div>
  )
}
