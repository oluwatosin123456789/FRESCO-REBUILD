import { OrderManager } from '@/components/farmer/order-manager'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Order Fulfillment Queue · Amaka Farms | Fresco',
  description: 'Track incoming buyer orders and advance fulfillment progression.',
}

export default function OrdersPage() {
  return <OrderManager />
}
