import { PassportView } from '@/components/farmer/passport-view'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Financial Passport · Amaka Okafor | Fresco',
  description: 'Verified agricultural commerce track record, FEAP score, and bank audit trail.',
}

export default function PassportPage() {
  return <PassportView />
}
