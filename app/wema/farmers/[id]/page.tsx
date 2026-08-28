import { getSession } from '@/lib/auth/session'
import { redirect, notFound } from 'next/navigation'
import { FARMERS } from '@/lib/seed/dashboard.seed'
import FarmerProfileClient from './FarmerProfileClient'
import '@/styles/wema.css'

export const dynamic = 'force-dynamic'

export default async function FarmerPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session?.wemaAnalyst) redirect('/wema/login')

  const { id } = await params
  const farmer = FARMERS.find((f) => f.id === id)
  if (!farmer) notFound()

  return <FarmerProfileClient farmerId={id} />
}
