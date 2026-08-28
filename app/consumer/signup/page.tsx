import type { Metadata } from 'next'
import { RoleAuthPage } from '@/components/auth/role-auth'

export const metadata: Metadata = {
  title: 'Consumer Sign Up · Fresco',
  description: 'Create a Fresco Consumer Marketplace account to shop verified produce directly from local farms.',
}

export default function ConsumerSignupPage() {
  return <RoleAuthPage role="consumer" mode="signup" />
}