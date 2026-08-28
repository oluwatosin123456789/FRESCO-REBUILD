import type { Metadata } from 'next'
import { RoleResetPage } from '@/components/auth/role-reset'

export const metadata: Metadata = {
  title: 'Reset Password · Wema Institutional Portal | Fresco',
  description: 'Reset your Wema Agricultural Credit Intelligence portal password.',
}

export default function WemaResetPage() {
  return <RoleResetPage role="wema" />
}