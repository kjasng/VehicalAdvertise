import { SidebarNav, type NavItem } from '@/components/shared/role-nav'

const NAV: NavItem[] = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/drivers-kyc', label: 'Drivers KYC' },
  { href: '/admin/creatives-review', label: 'Creatives review' },
  { href: '/admin/install-proofs', label: 'Install proofs' },
  { href: '/admin/photo-verifications', label: 'Photo verifications' },
  { href: '/admin/invoices/driver', label: 'Driver invoices' },
  { href: '/admin/invoices/partner', label: 'Partner invoices' },
  { href: '/admin/invoices/garage', label: 'Garage invoices' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/reports', label: 'Reports' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <SidebarNav title="Wheels Earner · Admin" items={NAV} />
      <section className="flex-1 p-6">{children}</section>
    </div>
  )
}
