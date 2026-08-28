// POST /api/wema/opportunities/[id]/dismiss

import { handle, unauthorized } from '@/lib/api-helpers'
import { getSessionUser } from '@/lib/auth/session'
import { dismissOpportunity } from '@/lib/domain/finance/opportunity.service'

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getSessionUser()
  if (!session) return unauthorized()
  return handle(async () => {
    const { id } = await context.params
    return dismissOpportunity(id)
  })
}