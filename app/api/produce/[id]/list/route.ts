// POST /api/produce/[id]/list · farmer lists produce on marketplace

import { handle, unauthorized } from '@/lib/api-helpers'
import { listProduce } from '@/lib/domain/marketplace/produce.service'
import { getSessionUser } from '@/lib/auth/session'

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getSessionUser()
  if (!session) return unauthorized()
  return handle(async () => {
    const { id } = await context.params
    return listProduce(id)
  })
}