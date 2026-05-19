import Link from 'next/link'

import { buttonVariants } from '@/components/ui/button'
import { CardGrid, EyebrowTitle, ImagePanel } from '@/components/public/marketing-blocks'
import { MarketingShell } from '@/components/public/marketing-layout'
import { images, processCards } from '@/components/public/marketing-data'

export const metadata = { title: 'How It Works · VehicalAdvertise' }

export default function HowItWorksPage() {
  return (
    <MarketingShell active="/how-it-works">
      {/* Page hero section */}
      <section
        className="flex min-h-[420px] items-center justify-center bg-cover bg-center px-6 text-center text-white"
        style={{ backgroundImage: `linear-gradient(#00000099, #00000099), url(${images.city})` }}
      >
        <h1 className="font-heading text-7xl leading-none md:text-8xl">HOW IT WORKS</h1>
      </section>

      {/* Process overview section */}
      <section className="grid lg:grid-cols-[590px_1fr]">
        <div className="flex flex-col justify-center gap-6 bg-black px-6 py-20 text-white lg:px-20">
          <p className="text-primary text-xs font-black uppercase">How it works</p>
          <h2 className="font-heading text-6xl leading-none">FROM SIGNUP TO LIVE CAMPAIGN</h2>
          <p className="text-base leading-7 text-white/75">
            Vehicle advertising has a messy middle: onboarding, decal review, route matching, proof
            photos, and live reports. VehicalAdvertise turns that into one clear flow.
          </p>
        </div>
        <div className="space-y-5 p-6 lg:p-12">
          <ImagePanel url={images.hero} label="Wrapped vehicle in city traffic" />
          <div className="grid gap-3 md:grid-cols-3">
            {['Verified installs', 'Live route proof', 'Weekly payouts'].map((item) => (
              <div key={item} className="rounded-md border border-black/15 p-4 font-bold">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dual path section */}
      <section className="bg-white px-6 py-20 lg:px-10">
        <div className="mx-auto max-w-7xl space-y-10">
          <EyebrowTitle
            eyebrow="Dual path"
            title="ONE FLOW FOR BOTH SIDES"
            text="Advertisers get verified city reach. Drivers get campaign income from routes they already drive."
          />
          <CardGrid items={processCards} darkIndex={2} />
          <Link href="/login" className={buttonVariants({ className: 'bg-primary rounded' })}>
            Begin onboarding
          </Link>
        </div>
      </section>
    </MarketingShell>
  )
}
