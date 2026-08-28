import type { Metadata } from 'next'
import { RoleAuthPage } from '@/components/auth/role-auth'

export const metadata: Metadata = {
  title: 'Farmer Login · Fresco',
  description: 'Sign in to the Fresco Farmer Workspace to list verified produce, fulfil orders and build your Financial Passport.',
}

export default function FarmerLoginPage() {
  return <RoleAuthPage role="farmer" mode="login" />
}