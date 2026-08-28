import type { Metadata } from 'next'
import { WemaRouteShell } from '@/components/wema/wema-route-shell'

export const metadata: Metadata = {
  title: 'Wema Bank · Agricultural Portfolio Portal | Fresco',
  description: 'Institutional agricultural finance portfolio, deterministic FEAP underwriting, and review pipeline.',
}

export default function WemaLayout({ children }: { children: React.ReactNode }) {
  return <WemaRouteShell>{children}</WemaRouteShell>
}