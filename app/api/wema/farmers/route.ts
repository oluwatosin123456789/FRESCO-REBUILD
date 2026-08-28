// GET /api/wema/summary · Wema dashboard KPIs (consented data only)
// GET /api/wema/farmers · searchable farmer list with consent status
// GET /api/wema/farmers/[id] · consented farmer profile

import { handle, unauthorized } from '@/lib/api-helpers'
import { getSessionUser } from '@/lib/auth/session'
import { getWemaFarmerList, getWemaFarmerProfile } from '@/lib/domain/wema/wema-dashboard.service'

export async function GET(request: Request) {
  const session = await getSessionUser()
  if (!session) return unauthorized()
  return handle(async () => {
    const url = new URL(request.url)
    const idMatch = url.pathname.match(/\/farmers\/([^/]+)/)
    if (idMatch) return getWemaFarmerProfile(idMatch[1])
    return getWemaFarmerList({ search: url.searchParams.get('search') ?? undefined })
  })
}