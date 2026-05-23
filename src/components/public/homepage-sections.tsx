import Link from 'next/link'
import {
  CircleCheck,
  MapPin,
  UserPlus,
  Wrench,
} from 'lucide-react'

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const asset = '/landing/pencil/'

const steps = [
  [UserPlus, '1', 'SIGN UP', 'Register your vehicle or create an advertising campaign in minutes.'],
  [Wrench, '2', 'GET WRAPPED', 'Visit an approved garage for professional decal installation on your vehicle.'],
  [MapPin, '3', 'EARN & TRACK', 'Drive normally and earn. Track campaigns and earnings via GPS in real time.'],
] as const

const benefits = [
  'Passive income from your daily commute',
  'GPS-tracked earnings in real time',
  'Flexible campaign selection',
  'Periodic photo verification for quality',
]

export const buttonMotion =
  'transition-all duration-500 ease-out hover:-translate-y-0.5 hover:scale-[1.03] focus-visible:-translate-y-0.5 focus-visible:scale-[1.03]'

export function HomeImageBlock({
  image,
  label,
  className,
}: {
  image: string
  label: string
  className?: string
}) {
  return (
    <div
      aria-label={label}
      className={cn('min-h-80 rounded-md bg-cover bg-center', className)}
      style={{ backgroundImage: `url(${asset}${image})` }}
    />
  )
}

export function HomeHeroSection() {
  return (
    <section className="grid bg-white lg:grid-cols-2">
      <div className="flex min-h-[539px] flex-col justify-center gap-6 px-6 py-20 md:px-20 lg:py-[100px]">
        <h1 className="font-heading text-5xl leading-none tracking-normal text-[#1a1a1a] md:text-[64px]">
          EVERY DRIVE
          <br />
          CARRIES
          <br />A MESSAGE
        </h1>
        <p className="max-w-xl text-base leading-6 text-[#666666]">
          Earn passive income by driving with ads on your vehicle. Businesses get measurable,
          mobile advertising that moves through the city.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/login?role=driver"
            className={buttonVariants({ className: cn('rounded bg-primary px-8 py-6 text-base font-semibold', buttonMotion) })}
          >
            Join as Driver
          </Link>
          <Link
            href="/for-advertisers"
            className={buttonVariants({
              variant: 'outline',
              className: cn(
                'rounded border-2 !border-primary px-8 py-6 text-base font-semibold text-primary hover:!border-transparent hover:bg-primary hover:text-white',
                buttonMotion,
              ),
            })}
          >
            Advertise Now
          </Link>
        </div>
      </div>
      <HomeImageBlock
        image="hero.jpg"
        label="Wrapped car moving through city traffic"
        className="min-h-[360px] rounded-none lg:min-h-[539px]"
      />
    </section>
  )
}

export function HomeHowItWorksSection() {
  return (
    <section className="bg-[#f7f8fa] px-6 py-20 lg:px-20">
      <div className="mx-auto max-w-7xl space-y-12">
        <h2 className="text-center font-heading text-5xl leading-none text-[#1a1a1a]">HOW IT WORKS</h2>
        <div className="grid gap-8 md:grid-cols-3">
          {steps.map(([Icon, number, title, text]) => (
            <article key={title} className="flex flex-col items-center rounded-md bg-white p-8 text-center shadow-[0_1px_4px_#00000040]">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary">
                <span className="font-heading text-2xl leading-none text-white">{number}</span>
              </div>
              <Icon className="mt-4 size-10 text-primary" aria-hidden="true" />
              <h3 className="mt-4 font-heading text-2xl leading-none text-[#1a1a1a]">{title}</h3>
              <p className="mt-4 text-sm leading-[1.5] text-[#666666]">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export function HomeDriverSection() {
  return (
    <section className="grid gap-[60px] bg-white px-6 py-20 lg:grid-cols-2 lg:px-20">
      <div className="flex flex-col justify-center gap-6">
        <h2 className="font-heading text-5xl leading-none text-[#1a1a1a] md:text-[56px]">EARN WHILE<br />YOU DRIVE</h2>
        <p className="max-w-xl text-base leading-[1.6] text-[#666666]">Turn your daily commute into a revenue stream. VehicalAdvertise connects vehicle owners with top brands for hassle-free mobile advertising.</p>
        <div className="grid gap-4">
          {benefits.map((benefit) => (
            <div key={benefit} className="flex items-center gap-3 text-base text-[#666666]">
              <CircleCheck className="size-5 shrink-0 text-primary" aria-hidden="true" />
              {benefit}
            </div>
          ))}
        </div>
        <Link href="/login?role=driver" className={buttonVariants({ className: cn('w-fit rounded bg-primary px-8 py-6 text-base font-semibold', buttonMotion) })}>
          Register Your Vehicle
        </Link>
      </div>
      <HomeImageBlock image="driver.jpg" label="Driver beside wrapped vehicle" className="min-h-[415px]" />
    </section>
  )
}

export function HomeStatsBar() {
  return (
    <section className="grid bg-primary px-6 py-12 text-center text-white md:grid-cols-4 lg:px-20">
      {[
        ['500+', 'Vehicles'],
        ['50+', 'Campaigns'],
        ['1M+', 'KM Tracked'],
        ['200+', 'Drivers'],
      ].map(([value, label]) => (
        <div key={label} className="py-4">
          <p className="font-heading text-5xl leading-none">{value}</p>
          <p className="mt-1 text-base text-white/85">{label}</p>
        </div>
      ))}
    </section>
  )
}
