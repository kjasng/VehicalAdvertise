import Link from 'next/link'
import {
  ArrowRight,
  Car,
  Check,
  ClipboardCheck,
  CreditCard,
  Route,
  ShieldCheck,
} from 'lucide-react'

import { buttonVariants } from '@/components/ui/button'
import { buttonMotion } from '@/components/public/homepage-sections'
import { MarketingShell } from '@/components/public/marketing-layout'
import { PageBanner, PencilImagePanel, SectionHeader } from '@/components/public/page-design-blocks'
import { cn } from '@/lib/utils'

export const metadata = { title: 'For Drivers · VehicalAdvertise' }

const driverFeatures = [
  [
    CreditCard,
    'PREDICTABLE PAY',
    'Know campaign terms and payout status before every drive window.',
  ],
  [
    ShieldCheck,
    'COMPLIANT DECALS',
    'Side-area installs keep glass, plates, lights, roof, front, and rear clear.',
  ],
  [Route, 'ROUTE CONTROL', 'Accept campaigns that match where and when you already drive.', true],
] as const

const requirements = [
  'Car age under 7 years',
  'Valid license',
  'Smartphone',
  'Clean vehicle photos',
] as const

export default function ForDriversPage() {
  return (
    <MarketingShell active="/for-drivers">
      <PageBanner title="FOR DRIVERS" image="drivers-banner.png" />

      <section className="grid bg-white lg:min-h-[470px] lg:grid-cols-[650px_1fr]">
        <div className="flex flex-col justify-center gap-[18px] bg-[#1a1a1a] px-6 py-20 text-white md:px-20 lg:py-[50px]">
          <div className="flex w-fit items-center gap-2 rounded bg-white/10 px-3.5 py-2">
            <Car className="text-primary size-4" aria-hidden="true" />
            <span className="text-xs font-semibold tracking-[1.5px]">FOR DRIVERS</span>
          </div>
          <h1 className="font-heading text-5xl leading-[0.98] md:text-[58px]">
            TURN YOUR
            <br />
            DAILY ROUTE
            <br />
            INTO INCOME
          </h1>
          <p className="max-w-xl text-base leading-[1.5] text-white/75">
            Earn from approved vehicle advertising while you keep your normal commute. We match your
            daily route with campaigns, handle compliant decals, and keep payouts clear.
          </p>
          <div className="flex flex-col gap-3.5 sm:flex-row">
            <Link
              href="/login?role=driver"
              className={buttonVariants({
                className: cn(
                  'bg-primary h-[50px] rounded px-6 text-[15px] font-bold',
                  buttonMotion,
                ),
              })}
            >
              Register Vehicle
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              href="#requirements"
              className={buttonVariants({
                variant: 'outline',
                className: cn(
                  'h-[50px] rounded border-2 !border-white bg-transparent px-6 text-[15px] font-semibold !text-white hover:!border-transparent hover:!bg-white hover:!text-[#1a1a1a]',
                  buttonMotion,
                ),
              })}
            >
              Check Requirements
            </Link>
          </div>
        </div>
        <div className="bg-white px-6 py-8 md:px-20 lg:px-6 lg:py-8 lg:pr-20">
          <PencilImagePanel
            image="driver-hero.png"
            label="Friendly driver beside a branded car"
            className="min-h-[360px] lg:h-full"
          >
            <div className="absolute bottom-8 left-8 flex w-[min(342px,calc(100%-64px))] gap-3 rounded-md bg-white p-4 shadow-[0_14px_28px_#00000040]">
              <span className="bg-primary w-2 rounded-full" />
              <div className="grid flex-1 grid-cols-[1fr_128px] gap-3">
                <div>
                  <p className="font-heading text-primary text-3xl leading-none">3.2M VND</p>
                  <p className="mt-1 text-xs font-bold text-[#666666]">Avg. monthly route value</p>
                </div>
                <div className="bg-primary rounded px-3 py-2 text-white">
                  <p className="text-xs font-bold">Next task</p>
                  <p className="text-xs text-white/80">Upload proof</p>
                </div>
              </div>
            </div>
          </PencilImagePanel>
        </div>
      </section>

      <section id="requirements" className="bg-[#f7f8fa] px-6 py-7 lg:px-20">
        <div className="mx-auto max-w-7xl space-y-4">
          <SectionHeader
            kicker="Driver benefits"
            title={
              <>
                BUILT FOR
                <br />
                REAL DRIVERS
              </>
            }
            text="Simple approval, professional decal handling, and transparent earnings built around your real commute."
          />

          <div className="grid gap-4 lg:grid-cols-[minmax(0,850px)_1fr]">
            <div className="grid gap-3 lg:grid-cols-3">
              {driverFeatures.map(([Icon, title, text, active]) => (
                <article
                  key={title}
                  className={cn(
                    'flex min-h-[140px] flex-col gap-2 rounded-md p-3.5',
                    active
                      ? 'bg-[#1a1a1a] text-white'
                      : 'border border-[#cbccc9] bg-white text-[#1a1a1a]',
                  )}
                >
                  <span className="bg-primary flex size-8 items-center justify-center rounded-full">
                    <Icon className="size-4 text-white" aria-hidden="true" />
                  </span>
                  <h3 className="font-heading text-xl leading-none">{title}</h3>
                  <p
                    className={cn(
                      'text-xs leading-[1.35]',
                      active ? 'text-white/65' : 'text-[#666666]',
                    )}
                  >
                    {text}
                  </p>
                </article>
              ))}
            </div>

            <aside className="rounded-md border border-[#cbccc9] bg-white p-3.5">
              <div className="mb-3 flex items-center gap-2">
                <ClipboardCheck className="text-primary size-4.5" aria-hidden="true" />
                <h3 className="font-heading text-xl leading-none text-[#1a1a1a]">REQUIREMENTS</h3>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                {requirements.map((requirement) => (
                  <p
                    key={requirement}
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#1a1a1a]"
                  >
                    <Check className="text-primary size-3.5" aria-hidden="true" />
                    {requirement}
                  </p>
                ))}
              </div>
            </aside>
          </div>

          <div className="flex flex-col items-start justify-between gap-4 rounded-md bg-[#1a1a1a] px-4 py-3 text-white sm:flex-row sm:items-center">
            <p className="font-heading text-[25px] leading-none">
              READY TO EARN ON YOUR DAILY ROUTE?
            </p>
            <Link
              href="/login?role=driver"
              className={buttonVariants({
                className: cn('bg-primary h-11 rounded px-5 text-sm font-extrabold', buttonMotion),
              })}
            >
              REGISTER VEHICLE
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </MarketingShell>
  )
}
