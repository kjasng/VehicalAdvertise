import Link from 'next/link'

import { buttonVariants } from '@/components/ui/button'
import { CardGrid, CtaBand, EyebrowTitle, ImagePanel } from '@/components/public/marketing-blocks'
import { MarketingShell } from '@/components/public/marketing-layout'
import { advertiserCards, images } from '@/components/public/marketing-data'

export const metadata = { title: 'For Advertisers · VehicalAdvertise' }

export default function ForAdvertisersPage() {
  return (
    <MarketingShell active="/for-advertisers">
      {/* Advertiser hero section */}
      <section className="grid lg:grid-cols-[660px_1fr]">
        <div className="space-y-5 p-6 lg:p-12">
          <ImagePanel url={images.advertiser} label="Campaign planning dashboard" />
          <div className="grid gap-4 md:grid-cols-2">
            {['District targeting', 'Install verification'].map((item) => (
              <div key={item} className="rounded-md border border-black/15 p-5 font-black">
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col justify-center gap-7 bg-black px-6 py-20 text-white lg:px-20">
          <p className="text-primary text-xs font-black uppercase">For advertisers</p>
          <h1 className="font-heading text-6xl leading-none">
            PUT YOUR BRAND ON STREETS THAT MOVE
          </h1>
          <p className="text-base leading-7 text-white/75">
            Launch vehicle campaigns with district targeting, verified installs, GPS reports, and
            spend control built for Hanoi streets.
          </p>
          <Link
            href="/contact"
            className={buttonVariants({ className: 'bg-primary w-fit rounded' })}
          >
            Launch a campaign
          </Link>
        </div>
      </section>

      {/* Campaign proof section */}
      <section className="bg-white px-6 py-20 lg:px-10">
        <div className="mx-auto max-w-7xl space-y-10">
          <EyebrowTitle
            eyebrow="Campaign proof"
            title="CONTROL THE MOVING MEDIA BUY"
            text="Every campaign has the operational proof advertisers need before scaling spend across the city."
          />
          <CardGrid items={advertiserCards} darkIndex={1} />
        </div>
      </section>

      {/* Final CTA section */}
      <CtaBand />
    </MarketingShell>
  )
}
