// POST /api/wema/finance · farmer submits Finance My Order request
// GET /api/wema/finance · Wema analyst views requests (or farmer views own)

import { handle, unauthorized } from '@/lib/api-helpers'
import { CreateFinanceRequestSchema } from '@/lib/validation/schemas'
import { createFinanceRequest } from '@/lib/domain/orders/order.service'
import { prisma } from '@/lib/db'
import { getSessionUser } from '@/lib/auth/session'

export async function POST(request: Request) {
  const session = await getSessionUser()
  if (!session) return unauthorized()
  return handle(async () => {
    const input = CreateFinanceRequestSchema.parse(await request.json())
    return createFinanceRequest(input)
  })
}

export async function GET() {
  const session = await getSessionUser()
  if (!session) return unauthorized()
  return handle(async () => {
    const where = session.wemaAnalyst
      ? {}
      : { farmerId: session.farmerId }
    return prisma.financeRequest.findMany({
      where,
      include: {
        farmer: { select: { farmName: true, location: true } },
        order: { select: { reference: true, total: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  })
}