import { ConsentManager } from '@/components/farmer/consent-manager'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Data Consent Controls · Wema Bank Sharing | Fresco',
  description: 'Control granular bank data access scopes with immutable audit logging.',
}

export default function ConsentPage() {
  return <ConsentManager />
}
