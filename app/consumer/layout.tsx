import type { Metadata } from 'next'
import { ConsumerRouteShell } from '@/components/consumer/consumer-route-shell'

export const metadata: Metadata = {
  title: 'Consumer Marketplace · Fresco',
  description: 'Discover Fresco-verified produce directly from local farms.',
}

export default function ConsumerLayout({ children }: { children: React.ReactNode }) {
  return <ConsumerRouteShell>{children}</ConsumerRouteShell>
}