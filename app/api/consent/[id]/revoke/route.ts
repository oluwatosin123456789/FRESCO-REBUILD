// POST /api/consent/[id]/revoke

import { handle, unauthorized } from '@/lib/api-helpers'
import { revokeConsent } from '@/lib/domain/consent/consent.service'
import { getSessionUser } from '@/lib/auth/session'

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getSessionUser()
  if (!session) return unauthorized()
  return handle(async () => {
    const { id } = await context.params
    return revokeConsent(id)
  })
}