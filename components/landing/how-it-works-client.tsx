'use client'

import dynamic from 'next/dynamic'

/**
 * Client-only mount for the How-It-Works carousel.
 *
 * The carousel is scroll-driven framer-motion content below the fold. Loading it with
 * `ssr: false` keeps its SSR'd inline motion styles (which mismatch on hydration because
 * framer injects a `transform` on the client) out of the initial HTML, and stops its step
 * images from being pulled in as LCP candidates.
 */
const HowItWorksCarousel = dynamic(
  () => import('@/components/landing/how-it-works').then((mod) => mod.HowItWorksCarousel),
  { ssr: false },
)

export default HowItWorksCarousel