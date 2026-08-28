import type { Metadata } from 'next'
import { RoleResetPage } from '@/components/auth/role-reset'

export const metadata: Metadata = {
  title: 'Reset Password · Farmer Workspace | Fresco',
  description: 'Reset your Farmer Workspace password to get back to listing verified produce.',
}

export default function FarmerResetPage() {
  return <RoleResetPage role="farmer" />
}