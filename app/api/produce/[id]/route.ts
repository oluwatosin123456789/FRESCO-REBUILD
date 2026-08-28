// GET /api/produce/[id] · produce detail

import { handle } from '@/lib/api-helpers'
import { getProduceDetail } from '@/lib/domain/marketplace/produce.service'

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const { id } = await context.params
    return getProduceDetail(id)
  })
}