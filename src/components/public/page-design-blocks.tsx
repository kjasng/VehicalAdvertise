import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

const asset = '/landing/pencil/'

export function PageBanner({
  title,
  image,
  className,
  titleClassName,
}: {
  title: string
  image: string
  className?: string
  titleClassName?: string
}) {
  return (
    <section
      className={cn(
        'flex min-h-[420px] items-center justify-center bg-cover bg-center px-6 text-center text-white',
        className,
      )}
      style={{
        backgroundImage: `linear-gradient(#00000066, #00000066), url(${asset}${image})`,
      }}
    >
      <h1
        className={cn(
          'font-heading text-[62px] leading-none tracking-normal md:text-[76px]',
          titleClassName,
        )}
      >
        {title}
      </h1>
    </section>
  )
}

export function PencilImagePanel({
  image,
  label,
  className,
  children,
}: {
  image: string
  label: string
  className?: string
  children?: ReactNode
}) {
  return (
    <div
      role="img"
      aria-label={label}
      className={cn('relative overflow-hidden rounded-md bg-cover bg-center', className)}
      style={{ backgroundImage: `url(${asset}${image})` }}
    >
      {children}
    </div>
  )
}

export function SectionHeader({
  kicker,
  title,
  text,
  className,
}: {
  kicker: string
  title: ReactNode
  text?: string
  className?: string
}) {
  return (
    <div className={cn('grid gap-8 lg:grid-cols-[1fr_470px] lg:items-end', className)}>
      <div className="space-y-3">
        <p className="text-primary text-[13px] font-extrabold uppercase">{kicker}</p>
        <h2 className="font-heading text-5xl leading-[1.06] text-[#1a1a1a]">{title}</h2>
      </div>
      {text && <p className="text-base leading-[1.5] text-[#666666]">{text}</p>}
    </div>
  )
}
