// POST /api/payments/initialize · consumer initiates demo payment
// POST /api/payments/verify · server-side verification

import { handle, unauthorized } from '@/lib/api-helpers'
import { PaymentInitializeSchema, PaymentVerifySchema } from '@/lib/validation/schemas'
import { initializePayment, verifyPayment } from '@/lib/domain/orders/order.service'
import { getSessionUser } from '@/lib/auth/session'

export async function POST(request: Request) {
  const session = await getSessionUser()
  if (!session) return unauthorized()

  const url = new URL(request.url)
  const action = url.pathname.endsWith('/verify') ? 'verify' : 'initialize'

  return handle(async () => {
    const body = await request.json()
    if (action === 'verify') {
      const input = PaymentVerifySchema.parse(body)
      return verifyPayment(input.reference)
    }
    const input = PaymentInitializeSchema.parse(body)
    return initializePayment(input.orderId)
  })
}