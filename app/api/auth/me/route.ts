// GET /api/auth/me · current session user + role

import { handle } from '@/lib/api-helpers'
import { getSessionUser } from '@/lib/auth/session'

export async function GET() {
  return handle(async () => {
    return getSessionUser()
  })
}