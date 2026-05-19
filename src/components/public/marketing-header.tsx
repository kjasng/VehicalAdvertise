import Link from 'next/link'

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/for-drivers', label: 'For Drivers' },
  { href: '/for-advertisers', label: 'For Advertisers' },
  { href: '/who-we-are', label: 'Who We Are' },
  { href: '/contact', label: 'Contact' },
]

export function MarketingHeader({ active }: { active: string }) {
  return (
    <header className="sticky top-0 z-30 border-b border-black/15 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">
        <Link href="/" className="font-heading text-3xl text-primary">
          VehicalAdvertise
        </Link>
        <nav className="hidden items-center gap-8 text-sm lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'transition hover:text-primary',
                active === item.href ? 'font-bold text-primary' : 'text-black',
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/login"
          className={buttonVariants({
            size: 'lg',
            className: 'hidden rounded bg-primary hover:bg-black md:inline-flex',
          })}
        >
          Get Started
        </Link>
      </div>
    </header>
  )
}
