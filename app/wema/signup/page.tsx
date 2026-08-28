import type { Metadata } from 'next'
import { RoleAuthPage } from '@/components/auth/role-auth'

export const metadata: Metadata = {
  title: 'Wema Bank Sign Up · Fresco',
  description: 'Request institutional access to the Wema Agricultural Credit Intelligence portal on Fresco.',
}

export default function WemaSignupPage() {
  return <RoleAuthPage role="wema" mode="signup" />
}