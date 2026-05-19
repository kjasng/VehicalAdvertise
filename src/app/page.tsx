import Link from 'next/link'

import { buttonVariants } from '@/components/ui/button'
import {
  CardGrid,
  CtaBand,
  EyebrowTitle,
  ImagePanel,
  SplitSection,
} from '@/components/public/marketing-blocks'
import { MarketingShell } from '@/components/public/marketing-layout'
import {
  advertiserCards,
  driverCards,
  images,
  processCards,
} from '@/components/public/marketing-data'

const stats = [
  ['500+', 'Vehicles'],
  ['50+', 'Campaigns'],
  ['1M+', 'KM tracked'],
  ['200+', 'Drivers'],
]

export default function LandingPage() {
  return (
    <MarketingShell active="/">
      {/* Hero section */}
      <section className="grid min-h-[680px] lg:grid-cols-2">
        <div className="flex flex-col justify-center gap-6 px-6 py-24 md:px-10 lg:px-20 lg:py-[100px]">
          <h1 className="font-heading text-[64px] leading-none tracking-normal text-black">
            EVERY DRIVE
            <br />
            CARRIES
            <br />A MESSAGE
          </h1>
          <p className="max-w-xl text-base leading-6 text-black/60">
            Earn passive income by driving with ads on your vehicle. Businesses get measurable,
            mobile advertising that moves through the city.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              href="/login?role=driver"
              className={buttonVariants({
                className: 'bg-primary rounded px-12 py-6 text-base font-semibold',
              })}
            >
              Join as Driver
            </Link>
            <Link
              href="/for-advertisers"
              className={buttonVariants({
                variant: 'outline',
                className:
                  '!border-primary text-primary hover:!border-primary/0 hover:bg-primary hover:text-primary-foreground focus-visible:!border-primary/0 focus-visible:bg-primary focus-visible:text-primary-foreground rounded border-2 px-12 py-6 text-base font-semibold transition-all duration-500 ease-out hover:-translate-y-0.5 hover:scale-[1.03] focus-visible:-translate-y-0.5 focus-visible:scale-[1.03]',
              })}
            >
              Advertise Now
            </Link>
          </div>
        </div>
        <ImagePanel url={images.hero} label="Wrapped car moving through the city" />
      </section>

      {/* How it works section */}
      <section className="bg-white px-6 py-20 lg:px-10">
        <div className="mx-auto max-w-7xl space-y-12">
          <EyebrowTitle
            eyebrow="How it works"
            title="THREE STEPS TO A LIVE CAMPAIGN"
            text="Driver onboarding, decal review, route matching, proof photos, and payouts stay in one clear operating flow."
            center
          />
          <CardGrid items={processCards.slice(0, 3)} />
        </div>
      </section>

      {/* Driver section */}
      <SplitSection
        eyebrow="For drivers"
        title="EARN WHILE YOU DRIVE"
        text="Turn your daily commute into a revenue stream. VehicalAdvertise connects vehicle owners with brands for hassle-free mobile advertising."
        image={images.driver}
        imageLabel="Driver on a Hanoi route"
        cta="Register as driver"
      />

      {/* Stats section */}
      <section className="bg-primary grid px-6 py-12 text-center text-white md:grid-cols-4 lg:px-10">
        {stats.map(([value, label]) => (
          <div key={label} className="py-4">
            <p className="font-heading text-5xl">{value}</p>
            <p className="mt-1 text-white/80">{label}</p>
          </div>
        ))}
      </section>

      {/* Advertiser section */}
      <SplitSection
        eyebrow="For advertisers"
        title="REACH MILLIONS ON THE MOVE"
        text="Launch targeted campaigns across Hanoi's busiest routes. Track impressions, QR interactions, install proof, and cost-per-kilometer from one dashboard."
        image={images.advertiser}
        imageLabel="Advertiser campaign planning desk"
        reverse
        cta="Plan a campaign"
      />

      {/* Garage network section */}
      <section className="bg-white px-6 py-20 lg:px-10">
        <div className="mx-auto max-w-7xl space-y-12">
          <EyebrowTitle
            eyebrow="Garage network"
            title="OUR GARAGE NETWORK"
            text="Verified garages across Hanoi handle professional decal installation, proof uploads, and handoff checks."
            center
          />
          <CardGrid items={[...driverCards, ...advertiserCards]} darkIndex={3} />
        </div>
      </section>

      {/* Final CTA section */}
      <CtaBand />
    </MarketingShell>
  )
}
