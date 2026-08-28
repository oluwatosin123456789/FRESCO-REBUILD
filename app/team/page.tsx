import { TeamClient } from '@/components/team/team-client'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'The Team · Fresco Protocol Architects',
  description: 'Meet the 3 founders and engineering architects behind the Fresco Agricultural Commerce Protocol.',
}

export default function TeamPage() {
  return <TeamClient />
}
