// GET /api/passport/timeline · farmer's passport event timeline

import { handle, unauthorized } from '@/lib/api-helpers'
import { getPassportTimeline } from '@/lib/domain/passport/passport.service'
import { getSessionUser } from '@/lib/auth/session'

export async function GET() {
  const session = await getSessionUser()
  if (!session) return unauthorized()
  return handle(async () => {
    if (!session.farmerId) throw new Error('Farmer profile required')
    return getPassportTimeline(session.farmerId)
  })
}