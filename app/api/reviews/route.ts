// POST /api/reviews · consumer reviews a completed order

import { handle, unauthorized } from '@/lib/api-helpers'
import { CreateReviewSchema } from '@/lib/validation/schemas'
import { createReview } from '@/lib/domain/orders/order.service'
import { getSessionUser } from '@/lib/auth/session'

export async function POST(request: Request) {
  const session = await getSessionUser()
  if (!session) return unauthorized()
  return handle(async () => {
    const input = CreateReviewSchema.parse(await request.json())
    return createReview(input)
  })
}