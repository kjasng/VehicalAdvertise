import { HomeCtaSection } from '@/components/public/homepage-cta-section'
import { MarketingShell } from '@/components/public/marketing-layout'
import { PageBanner, SectionHeader } from '@/components/public/page-design-blocks'
import { TeamGrid, ValuesGrid } from '@/components/public/who-we-are-cards'

export const metadata = { title: 'Who We Are · VehicalAdvertise' }

export default function WhoWeArePage() {
  return (
    <MarketingShell active="/who-we-are">
      <PageBanner
        title="WHO WE ARE"
        image="who-banner.png"
        className="min-h-[520px]"
        titleClassName="md:text-[74px]"
      />

      <section className="bg-white px-6 py-[72px] lg:px-20">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_460px] lg:items-center">
          <div className="space-y-[22px]">
            <p className="text-primary text-[13px] font-extrabold uppercase">
              About VehicalAdvertise
            </p>
            <h1 className="font-heading max-w-4xl text-5xl leading-[1.08] text-[#1a1a1a]">
              Building a connected community for Hanoi drivers and advertisers.
            </h1>
            <p className="max-w-3xl text-[17px] leading-[1.6] text-[#666666]">
              We are a team of mobility operators, brand strategists, and compliance-focused
              builders dedicated to making vehicle advertising measurable, trusted, and legally
              reviewable.
            </p>
          </div>
          <div className="space-y-[18px] rounded-lg border border-[#cbccc9] bg-[#f7f8fa] p-8">
            <h2 className="font-heading text-[34px] leading-none text-[#1a1a1a]">
              What we connect
            </h2>
            {[
              'Verified drivers with campaign-ready vehicles',
              'Advertisers with location-focused outdoor reach',
              'Creative review, invoices, and campaign proof in one flow',
            ].map((item) => (
              <p key={item} className="text-base leading-[1.45] font-semibold text-[#1a1a1a]">
                {item}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f7f8fa] px-6 py-20 lg:px-20">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2">
          <div className="flex flex-col justify-center gap-5">
            <p className="text-primary text-[13px] font-extrabold uppercase">Our story</p>
            <h2 className="font-heading text-[44px] leading-none text-[#1a1a1a]">HOW IT STARTED</h2>
            <p className="text-base leading-[1.65] text-[#666666]">
              Founded in 2026, VehicalAdvertise began as a response to a clear gap in Hanoi
              advertising: brands needed measurable local reach, while drivers needed a trusted way
              to earn from compliant vehicle decals.
            </p>
          </div>
          <div className="flex flex-col justify-center gap-5">
            <h2 className="font-heading text-[44px] leading-none text-[#1a1a1a]">
              WHERE WE ARE TODAY
            </h2>
            <p className="text-base leading-[1.65] text-[#666666]">
              Today, we bridge the gap between drivers and advertisers through verified onboarding,
              campaign dashboards, route-aware planning, photo verification, invoices, and creative
              checks.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ['500+', 'verified vehicles'],
                ['50+', 'campaigns tracked'],
              ].map(([value, label]) => (
                <div key={label} className="rounded-lg bg-white p-[18px]">
                  <p className="font-heading text-primary text-[34px] leading-none">{value}</p>
                  <p className="mt-1 text-[13px] font-semibold text-[#666666]">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-[72px] lg:px-20">
        <div className="mx-auto max-w-7xl space-y-10">
          <SectionHeader
            kicker="Core values"
            title={
              <>
                THE VALUES THAT KEEP
                <br />
                VEHICLE ADS TRUSTED
              </>
            }
            text="Our platform has to work for advertisers, drivers, and city-facing compliance teams at the same time."
          />
          <ValuesGrid />
        </div>
      </section>

      <section className="bg-[#f7f8fa] px-6 py-[72px] lg:px-20">
        <div className="mx-auto max-w-7xl space-y-10">
          <SectionHeader
            kicker="Meet the team"
            title={
              <>
                THE PEOPLE BEHIND
                <br />
                THE PLATFORM
              </>
            }
            text="VehicalAdvertise is built by operators who understand campaign accountability, driver workflows, secure onboarding, and vehicle decal programs."
          />
          <TeamGrid />
        </div>
      </section>

      <HomeCtaSection />
    </MarketingShell>
  )
}
