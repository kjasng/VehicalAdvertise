import { BottomNav, type NavItem } from '@/components/shared/role-nav'

const NAV: NavItem[] = [
  { href: '/driver/dashboard', label: 'Home' },
  { href: '/driver/verify', label: 'Verify' },
  { href: '/driver/invoice', label: 'Invoice' },
  { href: '/driver/profile', label: 'Profile' },
]

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 p-4">{children}</main>
      <BottomNav items={NAV} />
    </div>
  )
}
