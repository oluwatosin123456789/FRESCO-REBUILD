// GET /api/produce/mine · farmer's own produce listings

import { handle, unauthorized } from '@/lib/api-helpers'
import { getFarmerProduce } from '@/lib/domain/marketplace/produce.service'
import { getSessionUser } from '@/lib/auth/session'

export async function GET() {
  const session = await getSessionUser()
  if (!session) return unauthorized()
  return handle(async () => {
    if (!session.farmerId) throw new Error('Farmer profile required')
    return getFarmerProduce(session.farmerId)
  })
}