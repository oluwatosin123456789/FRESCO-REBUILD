import { ConsumerCart } from '@/components/consumer/cart-view'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Basket · Fresco Marketplace',
  description: 'Manage items and checkout with escrow settlement protection.',
}

export default function CartPage() {
  return <ConsumerCart />
}
