import { FeapView } from '@/components/farmer/feap-view'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FEAP Score Breakdown · Deterministic Evaluation | Fresco',
  description: 'Transparent 6-factor score explanation built from verified activity.',
}

export default function FeapPage() {
  return <FeapView />
}
