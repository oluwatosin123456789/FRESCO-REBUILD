import { FrescoScanner } from '@/components/farmer/fresco-scanner'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Fresco AI Scanner · Biometric Harvest Analysis | Fresco',
  description: 'Scan produce using live device webcam, grade freshness, and seal immutable passport records.',
}

export default function ScanPage() {
  return <FrescoScanner />
}
