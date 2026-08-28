import { getSession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import ReviewPipelineClient from './ReviewPipelineClient'
import '@/styles/wema.css'

export const dynamic = 'force-dynamic'

export default async function ReviewQueuePage() {
  const session = await getSession()
  if (!session?.wemaAnalyst) redirect('/wema/login')

  return <ReviewPipelineClient />
}