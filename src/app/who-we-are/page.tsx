import Link from 'next/link'

import { buttonVariants } from '@/components/ui/button'
import { CardGrid, EyebrowTitle } from '@/components/public/marketing-blocks'
import { MarketingShell } from '@/components/public/marketing-layout'
import { companyCards, images } from '@/components/public/marketing-data'

export const metadata = { title: 'Who We Are · VehicalAdvertise' }

export default function WhoWeArePage() {
  return (
    <MarketingShell active="/who-we-are">
      {/* Page hero section */}
      <section
        className="flex min-h-[520px] items-center justify-center bg-cover bg-center px-6 text-center text-white"
        style={{ backgroundImage: `linear-gradient(#00000099, #00000099), url(${images.city})` }}
      >
        <h1 className="font-heading text-7xl leading-none md:text-8xl">WHO WE ARE</h1>
      </section>

      {/* Company intro section */}
      <section className="px-6 py-20 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_460px] lg:items-center">
          <EyebrowTitle
            eyebrow="About VehicalAdvertise"
            title="BUILDING A CONNECTED COMMUNITY FOR HANOI DRIVERS AND ADVERTISERS"
            text="We are mobility operators, brand strategists, and compliance-focused builders making vehicle advertising measurable, trusted, and legally reviewable."
          />
          <div className="rounded-md border border-black/15 bg-white p-8">
            <h2 className="font-heading text-4xl">What we connect</h2>
            <div className="mt-6 space-y-4 font-bold">
              <p>Verified drivers with campaign-ready vehicles</p>
              <p>Advertisers with location-focused outdoor reach</p>
              <p>Creative review, invoices, and campaign proof in one flow</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values section */}
      <section className="bg-white px-6 py-20 lg:px-10">
        <div className="mx-auto max-w-7xl space-y-10">
          <EyebrowTitle
            eyebrow="Our values"
            title="TRUST FIRST, THEN SCALE"
            text="The platform keeps role workflows separate while the operating team can review compliance and financial health."
          />
          <CardGrid items={companyCards} darkIndex={1} />
        </div>
      </section>

      {/* Final CTA section */}
      <section className="bg-primary px-6 py-20 text-center text-white lg:px-10">
        <h2 className="font-heading text-5xl leading-none">READY TO BUILD A MOVING CAMPAIGN?</h2>
        <Link
          href="/contact"
          className={buttonVariants({ variant: 'secondary', className: 'mt-8' })}
        >
          Contact the team
        </Link>
      </section>
    </MarketingShell>
  )
}
