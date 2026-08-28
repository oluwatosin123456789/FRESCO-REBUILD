import type { Metadata } from 'next'
import { RoleAuthPage } from '@/components/auth/role-auth'

export const metadata: Metadata = {
  title: 'Farmer Sign Up · Fresco',
  description: 'Create a Fresco Farmer Workspace account and start turning verified harvest into an economic record.',
}

export default function FarmerSignupPage() {
  return <RoleAuthPage role="farmer" mode="signup" />
}