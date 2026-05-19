import Link from 'next/link'

const NAV = [
  { href: '/admin/approvals', label: 'Approvals' },
  { href: '/admin/payouts', label: 'Payouts' },
  { href: '/admin/fraud', label: 'Fraud' },
  { href: '/admin/pricing', label: 'Pricing' },
  { href: '/admin/audit', label: 'Audit' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-56 shrink-0 border-r bg-white p-4 md:block dark:bg-zinc-950">
        <div className="mb-6 text-sm font-semibold">Wheels Earner · Admin</div>
        <nav className="flex flex-col gap-1 text-sm">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded px-2 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <section className="flex-1 p-6">{children}</section>
    </div>
  )
}
