import type { Metadata } from 'next'
import { RoleAuthPage } from '@/components/auth/role-auth'

export const metadata: Metadata = {
  title: 'Wema Bank Login · Fresco',
  description: 'Sign in to the Wema Agricultural Credit Intelligence portal to review consent-gated farmer financial passports and FEAP underwriting.',
}

export default function WemaLoginPage() {
  return <RoleAuthPage role="wema" mode="login" />
}