// GET /api/ai/demand-insight · deterministic demand trend

import { handle, unauthorized } from '@/lib/api-helpers'
import { getSessionUser } from '@/lib/auth/session'
import { getDemandInsight } from '@/lib/domain/ai/coach.service'

export async function GET() {
  const session = await getSessionUser()
  if (!session) return unauthorized()
  return handle(async () => {
    return getDemandInsight()
  })
}