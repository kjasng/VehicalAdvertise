import {
  HomeDriverSection,
  HomeHeroSection,
  HomeHowItWorksSection,
  HomeStatsBar,
} from '@/components/public/homepage-sections'
import {
  HomeAdvertiserSection,
  HomeGarageNetworkSection,
  HomeTestimonialsSection,
} from '@/components/public/homepage-bottom-sections'
import { HomeCtaSection } from '@/components/public/homepage-cta-section'
import { MarketingShell } from '@/components/public/marketing-layout'

export default function LandingPage() {
  return (
    <MarketingShell active="/">
      <HomeHeroSection />
      <HomeHowItWorksSection />
      <HomeDriverSection />
      <HomeStatsBar />
      <HomeAdvertiserSection />
      <HomeGarageNetworkSection />
      <HomeTestimonialsSection />
      <HomeCtaSection />
    </MarketingShell>
  )
}
