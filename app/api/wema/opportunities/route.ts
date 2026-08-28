// GET /api/wema/opportunities · active opportunities
// POST /api/wema/opportunities/[id]/dismiss

import { handle, unauthorized } from '@/lib/api-helpers'
import { getSessionUser } from '@/lib/auth/session'
import { getWemaOpportunities } from '@/lib/domain/finance/opportunity.service'

export async function GET() {
  const session = await getSessionUser()
  if (!session) return unauthorized()
  return handle(async () => {
    return getWemaOpportunities()
  })
}