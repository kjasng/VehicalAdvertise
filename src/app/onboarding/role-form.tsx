'use client'

import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'

import { chooseRoleAction } from './actions'

import type { UserRole } from '@/types/db'

// Garage is intentionally excluded — handled manually by admin
type SelfAssignable = Exclude<UserRole, 'admin' | 'pending' | 'garage'>

// Each role advertises a feature image that reveals as the panel background on
// hover. Images live in /public/landing/pencil/ to stay consistent with the
// marketing pages.
const ROLES: {
  id: SelfAssignable
  label: string
  copy: string
  image: string
  alt: string
}[] = [
  {
    id: 'driver',
    label: 'I drive',
    copy: 'Earn from your commute. KYC + vehicle registration next.',
    image: '/landing/pencil/driver.jpg',
    alt: 'Driver beside branded car',
  },
  {
    id: 'partner',
    label: 'I advertise',
    copy: 'Run campaigns on vehicles in Hanoi. Top up, brief, go live.',
    image: '/landing/pencil/advertiser.jpg',
    alt: 'Advertiser planning campaign',
  },
]

export function RoleForm() {
  const [pending, startTransition] = useTransition()
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const submit = (role: SelfAssignable) => {
    startTransition(async () => {
      const fd = new FormData()
      fd.set('role', role)
      const result = await chooseRoleAction(fd)
      if (result && 'error' in result && result.error) {
        toast.error(result.error)
      }
    })
  }

  return (
    <div className="grid flex-1 grid-cols-1 lg:grid-cols-3">
      {ROLES.map(({ id, label, copy, image, alt }, i) => {
        const active = activeIndex === i
        const dimmed = activeIndex !== null && !active
        return (
          <button
            key={id}
            type="button"
            disabled={pending}
            onMouseEnter={() => setActiveIndex(i)}
            onMouseLeave={() => setActiveIndex(null)}
            onFocus={() => setActiveIndex(i)}
            onBlur={() => setActiveIndex(null)}
            onClick={() => submit(id)}
            // `isolate` confines child z-index to this button's stacking context
            // so the image layers don't leak behind the page's #1a1a1a background.
            className={cn(
              'group relative isolate flex min-h-[320px] flex-col justify-end overflow-hidden border-b border-white/10 px-8 py-12 text-left transition-opacity duration-500 last:border-b-0 lg:min-h-screen lg:border-r lg:border-b-0 lg:px-12 lg:py-16 lg:last:border-r-0',
              dimmed && 'opacity-60',
              pending && 'cursor-progress',
            )}
          >
            {/* Solid black plate sits at the bottom of the stack so inactive
                panels look like pure #1a1a1a. */}
            <div
              aria-hidden="true"
              className={cn(
                'absolute inset-0 z-0 bg-[#1a1a1a] transition-opacity duration-700',
                active ? 'opacity-0' : 'opacity-100',
              )}
            />

            {/* Image layer — preloaded for every panel so the first hover is
                instant, with a ken-burns zoom that lands on hover. */}
            <div
              className={cn(
                'absolute inset-0 z-[1] transition-transform duration-[1200ms] ease-out',
                active ? 'scale-100' : 'scale-110',
              )}
            >
              <Image
                src={image}
                alt={alt}
                fill
                priority
                quality={95}
                sizes="(max-width: 1024px) 100vw, 34vw"
                className={cn(
                  'object-cover transition-opacity duration-700 ease-out',
                  active ? 'opacity-100' : 'opacity-0',
                )}
              />
            </div>

            {/* Gradient overlay keeps the copy readable on top of the photo. */}
            <div
              aria-hidden="true"
              className={cn(
                'absolute inset-0 z-[2] bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-700',
                active ? 'opacity-100' : 'opacity-0',
              )}
            />

            {/* Content sits above all background layers. */}
            <div className="relative z-10 flex flex-col gap-3">
              <span
                className={cn(
                  'text-[11px] font-bold tracking-[2px] uppercase transition-colors duration-500',
                  active ? 'text-primary' : 'text-white/40',
                )}
              >
                Role · 0{i + 1}
              </span>
              <h2 className="font-heading text-5xl leading-[0.95] text-white uppercase lg:text-[64px]">
                {label}
              </h2>
              <p
                className={cn(
                  'max-w-xs text-sm leading-snug transition-colors duration-500 lg:text-base',
                  active ? 'text-white/90' : 'text-white/55',
                )}
              >
                {copy}
              </p>
              <span
                className={cn(
                  'mt-4 inline-flex items-center gap-2 text-sm font-semibold transition-all duration-500',
                  active
                    ? 'text-primary translate-x-0 opacity-100'
                    : '-translate-x-1 text-white/60 opacity-80',
                )}
              >
                {pending && active ? 'Loading' : 'Continue'}
                <ArrowRight aria-hidden="true" className="size-4" />
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
