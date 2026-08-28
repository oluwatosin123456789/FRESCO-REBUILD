import { Suspense } from 'react'
import { ConsumerBrowse } from '@/components/consumer/consumer-browse'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Browse Marketplace · Fresco',
  description: 'Explore verified produce listings directly from smallholder farms.',
}

export default function BrowsePage() {
  return (
    <Suspense fallback={null}>
      <ConsumerBrowse />
    </Suspense>
  )
}
