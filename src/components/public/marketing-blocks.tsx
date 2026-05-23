import Link from 'next/link'
import {
  ArrowRight,
  BadgeCheck,
  Camera,
  Car,
  MapPin,
  ReceiptText,
  Route,
  Shield,
} from 'lucide-react'

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type CardItem = { title: string; text: string }

const iconMap = [Car, BadgeCheck, Route, Camera, MapPin, ReceiptText, Shield]

export function EyebrowTitle({
  eyebrow,
  title,
  text,
  center = false,
}: {
  eyebrow: string
  title: string
  text?: string
  center?: boolean
}) {
  return (
    <div className={cn('space-y-4', center && 'mx-auto max-w-3xl text-center')}>
      <p className="text-xs font-black tracking-normal text-primary uppercase">{eyebrow}</p>
      <h2 className="font-heading text-5xl leading-none tracking-normal text-black md:text-6xl">
        {title}
      </h2>
      {text ? <p className="text-base leading-7 text-black/60">{text}</p> : null}
    </div>
  )
}

export function ImagePanel({ url, label }: { url: string; label: string }) {
  return (
    <div
      aria-label={label}
      className="min-h-80 rounded-md bg-cover bg-center shadow-sm"
      style={{ backgroundImage: `linear-gradient(#00000010, #00000010), url(${url})` }}
    />
  )
}

export function CardGrid({ items, darkIndex }: { items: CardItem[]; darkIndex?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item, index) => {
        const Icon = iconMap[index % iconMap.length]
        const dark = darkIndex === index

        return (
          <article
            key={item.title}
            className={cn(
              'rounded-md border p-6',
              dark ? 'border-black bg-black text-white' : 'border-black/15 bg-white text-black',
            )}
          >
            <Icon className="size-7 text-primary" />
            <h3 className="mt-5 text-lg font-black">{item.title}</h3>
            <p className={cn('mt-3 text-sm leading-6', dark ? 'text-white/70' : 'text-black/60')}>
              {item.text}
            </p>
          </article>
        )
      })}
    </div>
  )
}

export function SplitSection({
  eyebrow,
  title,
  text,
  image,
  imageLabel,
  reverse = false,
  cta,
}: {
  eyebrow: string
  title: string
  text: string
  image: string
  imageLabel: string
  reverse?: boolean
  cta?: string
}) {
  return (
    <section className="px-6 py-20 lg:px-10">
      <div
        className={cn(
          'mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center',
          reverse && 'lg:[&>*:first-child]:order-2',
        )}
      >
        <div className="space-y-8">
          <EyebrowTitle eyebrow={eyebrow} title={title} text={text} />
          {cta ? (
            <Link href="/login" className={buttonVariants({ className: 'rounded bg-primary' })}>
              {cta}
              <ArrowRight className="size-4" />
            </Link>
          ) : null}
        </div>
        <ImagePanel url={image} label={imageLabel} />
      </div>
    </section>
  )
}

export function CtaBand() {
  return (
    <section className="bg-primary px-6 py-24 text-center text-white lg:px-10">
      <div className="mx-auto max-w-4xl space-y-7">
        <h2 className="font-heading text-5xl leading-none md:text-6xl">
          READY TO GET YOUR MESSAGE MOVING?
        </h2>
        <p className="mx-auto max-w-2xl text-lg leading-8 text-white/80">
          Whether you drive daily routes or need city-level reach, VehicalAdvertise connects your
          next campaign to the road.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/login?role=driver" className={buttonVariants({ variant: 'secondary' })}>
            Start as driver
          </Link>
          <Link href="/contact" className={buttonVariants({ variant: 'outline' })}>
            Talk to sales
          </Link>
        </div>
      </div>
    </section>
  )
}
