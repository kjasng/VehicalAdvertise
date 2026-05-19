import Link from 'next/link'

import { buttonVariants } from '@/components/ui/button'

const ROLES = [
  { href: '/login?role=driver', label: 'Driver' },
  { href: '/login?role=partner', label: 'Partner' },
  { href: '/login?role=garage', label: 'Garage' },
]

export default function LandingPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-6 py-24 dark:bg-zinc-950">
      <div className="w-full max-w-xl space-y-8 text-center">
        <header className="space-y-3">
          <p className="text-sm font-medium tracking-wider text-zinc-500 uppercase">
            Wheels Earner · Hanoi pilot
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Earn from every kilometre you drive.
          </h1>
          <p className="text-base text-zinc-600 dark:text-zinc-400">
            Wrap your car in a partner campaign, drive your normal routes, and get paid weekly by
            SePay.
          </p>
        </header>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          {ROLES.map((r) => (
            <Link
              key={r.href}
              href={r.href}
              className={buttonVariants({ size: 'lg', variant: 'default' })}
            >
              Sign in as {r.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
