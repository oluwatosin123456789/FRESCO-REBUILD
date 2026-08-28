import { FinanceView } from '@/components/farmer/finance-view'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Finance My Order · Pre-Approved Working Capital | Fresco',
  description: 'Apply for order input financing and working capital lines linked to verified harvest orders.',
}

export default function FinancePage() {
  return <FinanceView />
}
