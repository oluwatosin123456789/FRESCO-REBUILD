import type { Metadata } from 'next'
import { CheckoutClient } from '@/components/marketplace/checkout-client'

export const metadata: Metadata = {
  title: 'Checkout · Fresco Marketplace',
  description: 'Complete your order with Fresco Escrow protection and live tracking.',
}

export default function CheckoutPage() {
  return <CheckoutClient />
}
