import Link from 'next/link'

import { cn } from '@/lib/utils'

export type NavItem = { href: string; label: string }

export function SidebarNav({ title, items }: { title: string; items: NavItem[] }) {
  return (
    <aside className="hidden w-56 shrink-0 border-r bg-white p-4 md:block dark:bg-zinc-950">
      <div className="mb-6 text-sm font-semibold">{title}</div>
      <nav className="flex flex-col gap-1 text-sm">
        {items.map((item) => (
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
  )
}

export function BottomNav({ items }: { items: NavItem[] }) {
  return (
    <nav className="sticky bottom-0 z-10 grid grid-cols-4 border-t bg-white text-xs dark:bg-zinc-950">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'flex flex-col items-center gap-1 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-900',
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  )
}

export function PlaceholderCard({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="text-sm text-zinc-500">{hint}</p>
      </header>
      <div className="rounded-lg border bg-white p-8 text-center text-sm text-zinc-500 dark:bg-zinc-950">
        Coming soon.
      </div>
    </div>
  )
}
