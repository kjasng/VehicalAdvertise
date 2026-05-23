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
    <header className="bg-white">
      <div className="mx-auto flex min-h-[82px] max-w-[1440px] items-center justify-between px-6 py-5 lg:px-20">
        <Link href="/" className="font-heading text-[28px] leading-none text-primary">
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
            className: 'hidden rounded bg-primary px-6 py-5 text-sm font-semibold md:inline-flex',
          })}
        >
          Get Started
        </Link>
      </div>
    </header>
  )
}
