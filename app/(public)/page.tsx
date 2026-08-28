import { jsonLd } from '@/lib/landing/content'
import { LandingHeader } from '@/components/landing/header'
import { FrescoPreloader } from '@/components/landing/fresco-preloader'
import { LandingScrollTarget } from '@/components/landing/landing-scroll-target'
import { HeroRunway } from '@/components/landing/hero-runway'
import { SystemActivityStrip } from '@/components/landing/system-activity-strip'
import { FinancialPassport } from '@/components/landing/financial-passport'
import { PassportSimulator } from '@/components/landing/passport-simulator'
import { TrustArchitecture } from '@/components/landing/trust-architecture'
import { OpportunitySection } from '@/components/landing/opportunity-teaser'
import { WemaDashboard } from '@/components/landing/wema-dashboard'
import { StoriesCarousel } from '@/components/landing/stories-carousel'
import { Newsletter } from '@/components/landing/newsletter'
import { LandingFooter } from '@/components/landing/footer'
import HowItWorksCarousel from '@/components/landing/how-it-works-client'

export default function LandingPage() {
  return (
    <main id="top">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <FrescoPreloader />
      <LandingScrollTarget />
      <LandingHeader />
      <HeroRunway />
      <SystemActivityStrip />
      <HowItWorksCarousel />
      <FinancialPassport />
      <PassportSimulator />
      <TrustArchitecture />
      <OpportunitySection />
      <WemaDashboard />
      <StoriesCarousel />
      <Newsletter />
      <LandingFooter />
    </main>
  )
}