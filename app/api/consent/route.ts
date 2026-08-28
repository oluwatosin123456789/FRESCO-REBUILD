// GET /api/consent · farmer's consent records
// POST /api/consent · grant consent (scopes + institution)
// POST /api/consent/[id]/revoke · revoke consent

import { handle, unauthorized } from '@/lib/api-helpers'
import { CreateConsentSchema } from '@/lib/validation/schemas'
import { createConsent, getConsents } from '@/lib/domain/consent/consent.service'
import { getSessionUser } from '@/lib/auth/session'

export async function GET() {
  const session = await getSessionUser()
  if (!session) return unauthorized()
  return handle(async () => {
    return getConsents()
  })
}

export async function POST(request: Request) {
  const session = await getSessionUser()
  if (!session) return unauthorized()
  return handle(async () => {
    const input = CreateConsentSchema.parse(await request.json())
    return createConsent(input)
  })
}