import { CoachPanel } from '@/components/farmer/coach-panel'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Growth Coach · Actionable Recommendations | Fresco',
  description: 'AI insights to increase harvest yields, improve fulfillment, and elevate FEAP score.',
}

export default function CoachPage() {
  return <CoachPanel />
}
