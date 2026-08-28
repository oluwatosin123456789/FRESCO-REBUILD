import { FarmerDashboard } from '@/components/farmer/farmer-dashboard'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Farmer Workspace · Amaka Farms | Fresco',
  description: 'Manage produce listings, AI biometric scans, verified orders, Financial Passport, and bank data consent.',
}

export default function FarmerPage() {
  return <FarmerDashboard />
}
