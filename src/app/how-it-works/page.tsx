import Link from 'next/link'
import { ArrowRight, Clock3, MapPinned, PanelTop } from 'lucide-react'

import { buttonVariants } from '@/components/ui/button'
import { MarketingShell } from '@/components/public/marketing-layout'
import { cn } from '@/lib/utils'

export const metadata = { title: 'How It Works · VehicalAdvertise' }

const featureCards = [
  [Clock3, '24h Onboarding'],
  [MapPinned, 'GPS Tracking'],
  [PanelTop, 'Side / Full Wrap'],
] as const

const processSteps = [
  [
    '01',
    'Register',
    'Drivers or brands create an account and share the basic campaign or vehicle details.',
  ],
  ['02', 'Verify', 'We check vehicle quality, decal fit, campaign creative, and launch readiness.'],
  [
    '03',
    'Match',
    'Routes are matched to brand goals using district focus, commute patterns, and manual approval.',
    true,
  ],
  [
    '04',
    'Track',
    'Live GPS reporting and proof photos keep campaign delivery visible from launch.',
  ],
] as const

const buttonMotion =
  'transition-all duration-500 ease-out hover:-translate-y-0.5 hover:scale-[1.03] focus-visible:-translate-y-0.5 focus-visible:scale-[1.03]'

function BackgroundPanel({
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
      className={cn('rounded-md bg-cover bg-center', className)}
      style={{ backgroundImage: `url(/landing/pencil/${image})` }}
    />
  )
}

export default function HowItWorksPage() {
  return (
    <MarketingShell active="/how-it-works">
      <section
        className="flex min-h-[420px] items-center justify-center bg-cover bg-center px-6 text-center text-white"
        style={{
          backgroundImage:
            'linear-gradient(#00000066, #00000066), url(/landing/pencil/how-banner.jpg)',
        }}
      >
        <h1 className="font-heading text-[76px] leading-none md:text-[88px]">HOW IT WORKS</h1>
      </section>

      <section className="grid bg-white lg:min-h-[620px] lg:grid-cols-[590px_1fr]">
        <div className="flex flex-col justify-center gap-6 bg-[#1a1a1a] px-6 py-20 text-white md:px-20 lg:py-[72px]">
          <p className="text-primary text-[13px] font-extrabold tracking-normal uppercase">
            How it works
          </p>
          <h2 className="font-heading text-5xl leading-[1.02] md:text-[62px]">
            FROM SIGNUP TO
            <br />
            LIVE CAMPAIGN
          </h2>
          <p className="text-[17px] leading-[1.6] text-white/80">
            Vehicle advertising has a messy middle: driver onboarding, decal review, route matching,
            proof photos, and live reports. VehicalAdvertise turns that into one clear flow for both
            sides of the marketplace.
          </p>
        </div>
        <div className="grid gap-[18px] bg-white px-6 py-12 md:px-20 lg:px-9 lg:py-12">
          <BackgroundPanel
            image="how-city.jpg"
            label="Wrapped vehicle moving through the city"
            className="min-h-[340px] lg:min-h-0"
          />
          <div className="grid gap-3 md:grid-cols-3">
            {featureCards.map(([Icon, label]) => (
              <div
                key={label}
                className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-md border border-[#cbccc9] bg-[#f7f8fa] text-center"
              >
                <Icon className="text-primary size-6" aria-hidden="true" />
                <p className="text-sm font-extrabold text-[#1a1a1a]">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f7f8fa] px-6 py-14 lg:px-20">
        <div className="mx-auto max-w-7xl space-y-7">
          <div className="grid gap-8 lg:grid-cols-[1fr_470px] lg:items-end">
            <div className="space-y-3">
              <p className="text-primary text-[13px] font-extrabold uppercase">Dual path</p>
              <h2 className="font-heading text-5xl leading-none text-[#1a1a1a]">
                One Route, Two Sides.
              </h2>
            </div>
            <p className="text-base leading-[1.5] text-[#666666]">
              Advertisers get verified city reach. Drivers get campaign income from routes they
              already drive.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-4">
            {processSteps.map(([number, title, text, active]) => (
              <article
                key={number}
                className={cn(
                  'flex min-h-[210px] flex-col gap-3.5 rounded-lg p-[22px]',
                  active
                    ? 'bg-[#1a1a1a] text-white'
                    : 'border border-[#cbccc9] bg-white text-[#1a1a1a]',
                )}
              >
                <p className="text-primary text-[13px] font-black">{number}</p>
                <h3 className="font-heading text-3xl leading-none">{title}</h3>
                <p
                  className={cn(
                    'text-sm leading-[1.5]',
                    active ? 'text-white/80' : 'text-[#666666]',
                  )}
                >
                  {text}
                </p>
              </article>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/login"
              className={buttonVariants({
                className: cn(
                  'bg-primary h-[50px] rounded px-7 text-[15px] font-extrabold',
                  buttonMotion,
                ),
              })}
            >
              Start the Flow
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              href="/for-drivers"
              className={buttonVariants({
                variant: 'outline',
                className: cn(
                  'h-[50px] rounded border !border-[#1a1a1a] !bg-white px-7 text-[15px] font-extrabold !text-[#1a1a1a] hover:!border-transparent hover:!bg-[#1a1a1a] hover:!text-white focus-visible:!border-[#1a1a1a] focus-visible:!bg-white focus-visible:!text-[#1a1a1a]',
                  buttonMotion,
                ),
              })}
            >
              View Driver Path
            </Link>
          </div>
        </div>
      </section>
    </MarketingShell>
  )
}
