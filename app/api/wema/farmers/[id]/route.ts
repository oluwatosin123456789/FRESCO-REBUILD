// GET /api/wema/farmers/[id] · Wema farmer profile (consented data only)

import { handle, unauthorized } from '@/lib/api-helpers'
import { getSessionUser } from '@/lib/auth/session'
import { getWemaFarmerProfile } from '@/lib/domain/wema/wema-dashboard.service'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionUser()
  if (!session) return unauthorized()
  return handle(async () => {
    const { id } = await params
    return getWemaFarmerProfile(id)
  })
}