import { OrderTracker } from '@/components/consumer/order-tracker'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Track Orders · Fresco Marketplace',
  description: 'Track live orders and confirm delivery receipt.',
}

export default function ConsumerOrdersPage() {
  return <OrderTracker />
}
