// POST /api/payments/verify · server-side demo payment verification

import { handle, unauthorized } from '@/lib/api-helpers'
import { PaymentVerifySchema } from '@/lib/validation/schemas'
import { verifyPayment } from '@/lib/domain/orders/order.service'
import { getSessionUser } from '@/lib/auth/session'

export async function POST(request: Request) {
  const session = await getSessionUser()
  if (!session) return unauthorized()
  return handle(async () => {
    const body = await request.json()
    const input = PaymentVerifySchema.parse(body)
    return verifyPayment(input.reference)
  })
}