import Link from 'next/link'

import { buttonVariants } from '@/components/ui/button'
import { CardGrid, CtaBand, EyebrowTitle, ImagePanel } from '@/components/public/marketing-blocks'
import { MarketingShell } from '@/components/public/marketing-layout'
import { driverCards, images } from '@/components/public/marketing-data'

export const metadata = { title: 'For Drivers · VehicalAdvertise' }

export default function ForDriversPage() {
  return (
    <MarketingShell active="/for-drivers">
      {/* Driver hero section */}
      <section className="grid lg:grid-cols-[1fr_590px]">
        <div className="space-y-5 p-6 lg:p-12">
          <ImagePanel url={images.driver} label="Driver commuting through Hanoi" />
          <div className="bg-primary rounded-md p-6 text-white">
            <p className="font-heading text-4xl">200+ drivers</p>
            <p className="mt-2 text-sm text-white/80">Pilot network across daily Hanoi routes.</p>
          </div>
        </div>
        <div className="flex flex-col justify-center gap-7 bg-black px-6 py-20 text-white lg:px-20">
          <p className="text-primary text-xs font-black uppercase">For drivers</p>
          <h1 className="font-heading text-6xl leading-none">TURN DAILY ROUTES INTO INCOME</h1>
          <p className="text-base leading-7 text-white/75">
            Apply with your vehicle, complete verification, install approved decals, and get paid
            for campaigns on routes you already drive.
          </p>
          <Link
            href="/login?role=driver"
            className={buttonVariants({ className: 'bg-primary w-fit rounded' })}
          >
            Register as driver
          </Link>
        </div>
      </section>

      {/* Driver benefits section */}
      <section className="bg-white px-6 py-20 lg:px-10">
        <div className="mx-auto max-w-7xl space-y-10">
          <EyebrowTitle
            eyebrow="Driver benefits"
            title="BUILT FOR REAL DRIVERS"
            text="Simple onboarding, verified installs, clear invoices, and campaign proof without extra admin work."
          />
          <CardGrid items={driverCards} />
        </div>
      </section>

      {/* Final CTA section */}
      <CtaBand />
    </MarketingShell>
  )
}
