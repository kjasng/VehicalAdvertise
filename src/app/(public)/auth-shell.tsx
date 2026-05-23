import Image from 'next/image'
import Link from 'next/link'

import { cn } from '@/lib/utils'

type AuthShellProps = {
  visualTitle: string
  visualCopy: string
  heroSrc: string
  heroAlt: string
  // Side the dark visual panel sits on. Login = right, signup = left
  // per the Pencil design (XdcYt / Xdz2m).
  visualSide: 'left' | 'right'
  children: React.ReactNode
}

// Split-screen auth layout: dark visual panel (560px) on one side, white
// form panel on the other. Visual panel hides below the lg breakpoint so the
// form gets the full viewport on small screens.
export function AuthShell({
  visualTitle,
  visualCopy,
  heroSrc,
  heroAlt,
  visualSide,
  children,
}: AuthShellProps) {
  return (
    <div
      className={cn(
        'flex min-h-screen flex-col lg:flex-row',
        visualSide === 'right' && 'lg:flex-row-reverse',
      )}
    >
      <aside className="hidden shrink-0 flex-col justify-center gap-6 bg-[#1a1a1a] px-12 py-[60px] text-white lg:flex lg:w-[560px]">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-heading text-primary text-[36px] leading-none">
            VehicalAdvertise
          </span>
          <span className="text-sm font-medium text-white/40">Auth</span>
        </Link>
        <h2 className="font-heading text-[32px] leading-[1.05] whitespace-pre-line uppercase">
          {visualTitle}
        </h2>
        <p className="text-[15px] leading-[1.6] text-white/60">{visualCopy}</p>
        <div className="relative h-[280px] overflow-hidden rounded-2xl">
          <Image src={heroSrc} alt={heroAlt} fill className="object-cover" priority />
        </div>
      </aside>
      <main className="flex flex-1 items-center justify-center bg-white px-6 py-12 sm:px-12 sm:py-[60px] lg:px-20">
        <div className="w-full max-w-[420px]">{children}</div>
      </main>
    </div>
  )
}
