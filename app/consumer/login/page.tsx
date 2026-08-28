import type { Metadata } from 'next'
import { RoleAuthPage } from '@/components/auth/role-auth'

export const metadata: Metadata = {
  title: 'Consumer Login · Fresco',
  description: 'Sign in to the Fresco Consumer Marketplace to buy verified produce carrying its own quality report.',
}

export default function ConsumerLoginPage() {
  return <RoleAuthPage role="consumer" mode="login" />
}