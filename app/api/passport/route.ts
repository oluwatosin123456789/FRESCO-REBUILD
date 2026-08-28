// GET /api/passport · current farmer's passport
// POST /api/passport/recalculate · deterministic recalculation

import { handle, unauthorized } from '@/lib/api-helpers'
import { getFinancialPassport, recalculateFinancialPassport } from '@/lib/domain/passport/passport.service'
import { getSessionUser } from '@/lib/auth/session'

export async function GET() {
  const session = await getSessionUser()
  if (!session) return unauthorized()
  return handle(async () => {
    if (!session.farmerId) throw new Error('Farmer profile required')
    return getFinancialPassport(session.farmerId)
  })
}

export async function POST() {
  const session = await getSessionUser()
  if (!session) return unauthorized()
  return handle(async () => {
    if (!session.farmerId) throw new Error('Farmer profile required')
    return recalculateFinancialPassport(session.farmerId)
  })
}