import { LoginHub } from '@/components/auth/login-hub'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In · Fresco',
  description: 'Choose your Fresco role — Farmer, Consumer or Wema — to sign in.',
}

export default function AuthLoginPage() {
  return <LoginHub />
}