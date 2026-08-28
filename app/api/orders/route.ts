// POST /api/orders · consumer creates order (server-side totals)
// GET /api/orders · consumer's orders

import { handle, unauthorized } from '@/lib/api-helpers'
import { CreateOrderSchema } from '@/lib/validation/schemas'
import { createOrder } from '@/lib/domain/orders/order.service'
import { prisma } from '@/lib/db'
import { getSessionUser } from '@/lib/auth/session'

export async function POST(request: Request) {
  const session = await getSessionUser()
  if (!session) return unauthorized()
  return handle(async () => {
    const input = CreateOrderSchema.parse(await request.json())
    return createOrder(input)
  })
}

export async function GET() {
  const session = await getSessionUser()
  if (!session) return unauthorized()
  return handle(async () => {
    return prisma.order.findMany({
      where: session.role === 'FARMER' ? { farmerId: session.farmerId ?? '' } : { consumerId: session.id },
      include: {
        items: { include: { produce: { select: { name: true, imageUrl: true, unit: true } } } },
        consumer: { select: { name: true } },
        farmer: { select: { farmName: true, location: true } },
        reviews: { select: { rating: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  })
}