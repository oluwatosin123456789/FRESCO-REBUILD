import type { Metadata } from 'next'
import { RoleResetPage } from '@/components/auth/role-reset'

export const metadata: Metadata = {
  title: 'Reset Password · Consumer Marketplace | Fresco',
  description: 'Reset your Consumer Marketplace password to get back to buying verified produce.',
}

export default function ConsumerResetPage() {
  return <RoleResetPage role="consumer" />
}