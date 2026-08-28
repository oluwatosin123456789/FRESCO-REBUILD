import { ProduceManager } from '@/components/farmer/produce-manager'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Produce Listings · Amaka Farms | Fresco',
  description: 'Manage verified produce listings, batches, and quality evidence.',
}

export default function ProducePage() {
  return <ProduceManager />
}
