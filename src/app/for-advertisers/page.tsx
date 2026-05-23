import Link from 'next/link'
import { Activity, ArrowRight, Camera, Map, Wallet } from 'lucide-react'

import { buttonVariants } from '@/components/ui/button'
import { buttonMotion } from '@/components/public/homepage-sections'
import { MarketingShell } from '@/components/public/marketing-layout'
import { PageBanner, PencilImagePanel, SectionHeader } from '@/components/public/page-design-blocks'
import { cn } from '@/lib/utils'

export const metadata = { title: 'For Advertisers · VehicalAdvertise' }

const proofCards = [
  [
    Map,
    'Route Targeting',
    'Target specific Hanoi districts, commute corridors, or high-traffic brand zones.',
  ],
  [
    Camera,
    'Verified Installs',
    'Receive wrap photos and approval records before the car hits the road.',
  ],
  [
    Activity,
    'Live Reporting',
    'Dashboard access for GPS movement, proof status, and heatmap-ready campaign activity.',
    true,
  ],
  [
    Wallet,
    'Spend Control',
    'Run small local tests or scale city-wide takeovers with flexible campaign budgets.',
  ],
] as const

export default function ForAdvertisersPage() {
  return (
    <MarketingShell active="/for-advertisers">
      <PageBanner title="FOR ADVERTISERS" image="advertisers-banner.png" />

      <section className="grid bg-white lg:min-h-[620px] lg:grid-cols-[660px_1fr]">
        <div className="flex flex-col gap-[18px] bg-white px-6 py-12 md:px-20 lg:px-20 lg:py-12 lg:pr-9">
          <PencilImagePanel
            image="advertisers-dashboard.png"
            label="Advertiser campaign dashboard planning session"
            className="min-h-[360px] flex-1"
          />
          <div className="grid min-h-28 gap-3 sm:grid-cols-2">
            <div className="flex flex-col justify-center rounded-lg bg-[#1a1a1a] p-4 text-white">
              <p className="font-heading text-primary text-[42px] leading-none">500+</p>
              <p className="mt-1 text-sm font-extrabold">Active Drivers</p>
            </div>
            <div className="flex flex-col justify-center rounded-lg border border-[#cbccc9] bg-[#f7f8fa] p-4">
              <p className="font-heading text-primary text-[42px] leading-none">1M+</p>
              <p className="mt-1 text-sm font-extrabold text-[#1a1a1a]">Impressions / Month</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center gap-6 bg-[#1a1a1a] px-6 py-20 text-white md:px-20 lg:py-[72px]">
          <p className="text-primary text-[13px] font-extrabold uppercase">For advertisers</p>
          <h1 className="font-heading text-5xl leading-[1.02] md:text-[62px]">
            PUT YOUR BRAND
            <br />
            ON STREETS
            <br />
            THAT MOVE
          </h1>
          <p className="max-w-xl text-[17px] leading-[1.6] text-white/80">
            Launch vehicle campaigns with district targeting, verified installs, live GPS reports,
            and spend control built for Hanoi streets.
          </p>
          <Link
            href="/contact"
            className={buttonVariants({
              className: cn(
                'bg-primary h-[50px] w-fit rounded-md px-7 text-[15px] font-extrabold',
                buttonMotion,
              ),
            })}
          >
            Launch Campaign
          </Link>
        </div>
      </section>

      <section className="bg-[#f7f8fa] px-6 py-14 lg:px-20">
        <div className="mx-auto max-w-7xl space-y-7">
          <SectionHeader
            kicker="Proof section"
            title="Campaigns with Proof."
            text="Every campaign has the operational proof advertisers need before scaling spend across the city."
          />

          <div className="grid gap-4 md:grid-cols-2">
            {proofCards.map(([Icon, title, text, active]) => (
              <article
                key={title}
                className={cn(
                  'min-h-[180px] rounded-lg p-[22px]',
                  active
                    ? 'bg-[#1a1a1a] text-white'
                    : 'border border-[#cbccc9] bg-white text-[#1a1a1a]',
                )}
              >
                <Icon className="text-primary size-6" aria-hidden="true" />
                <h3 className="font-heading mt-3 text-[28px] leading-none">{title}</h3>
                <p
                  className={cn(
                    'mt-3 text-sm leading-[1.5]',
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
              href="/contact"
              className={buttonVariants({
                className: cn(
                  'bg-primary h-[50px] rounded-md px-7 text-[15px] font-extrabold',
                  buttonMotion,
                ),
              })}
            >
              Launch Campaign
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              href="/how-it-works"
              className={buttonVariants({
                variant: 'outline',
                className: cn(
                  'h-[50px] rounded-md border !border-[#1a1a1a] !bg-white px-7 text-[15px] font-extrabold !text-[#1a1a1a] hover:!border-transparent hover:!bg-[#1a1a1a] hover:!text-white',
                  buttonMotion,
                ),
              })}
            >
              See Reporting Demo
            </Link>
          </div>
        </div>
      </section>
    </MarketingShell>
  )
}
