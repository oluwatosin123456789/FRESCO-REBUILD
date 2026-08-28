// POST /api/ai/farmer-coach · structured insights with deterministic fallback

import { handle, unauthorized } from '@/lib/api-helpers'
import { getSessionUser } from '@/lib/auth/session'
import { getFarmerInsights } from '@/lib/domain/ai/coach.service'

export async function POST() {
  const session = await getSessionUser()
  if (!session) return unauthorized()
  return handle(async () => {
    return getFarmerInsights()
  })
}