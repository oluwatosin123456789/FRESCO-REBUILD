import { ConsumerHome } from '@/components/consumer/consumer-home'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Discover · Fresco Verified Produce | Fresco',
  description: 'Discover Fresco-verified produce from nearby farms, tracked from harvest to your kitchen.',
}

export default function ConsumerPage() {
  return <ConsumerHome />
}
