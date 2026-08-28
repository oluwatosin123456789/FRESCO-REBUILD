// GET /api/orders/[id] · order detail (owner or farmer)
// PATCH /api/orders/[id]/status · farmer advances fulfillment

import { handle, unauthorized } from '@/lib/api-helpers'
import { OrderStatusSchema } from '@/lib/validation/schemas'
import { getOrderForConsumer, updateOrderStatus } from '@/lib/domain/orders/order.service'
import { getSessionUser } from '@/lib/auth/session'

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getSessionUser()
  if (!session) return unauthorized()
  return handle(async () => {
    const { id } = await context.params
    return getOrderForConsumer(id)
  })
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getSessionUser()
  if (!session) return unauthorized()
  return handle(async () => {
    const { id } = await context.params
    const body = (await request.json().catch(() => ({}))) as { status?: string }
    const status = OrderStatusSchema.parse(body.status)
    return updateOrderStatus(id, status)
  })
}