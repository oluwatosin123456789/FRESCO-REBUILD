// Order domain service (PRD FR-009/010/011, Essentials §7.2, Architecture §25)
// Order completion triggers: passport → FEAP → Wema opportunity recalculation.

import { prisma } from '@/lib/db'
import { AppError } from '@/lib/api'
import { logger } from '@/lib/logger'
import { recalculateFinancialPassport } from '@/lib/domain/passport/passport.service'
import { syncWemaOpportunities } from '@/lib/domain/finance/opportunity.service'
import { getPaymentProvider } from '@/lib/providers/payment/payment-provider'
import { getFinancingProvider } from '@/lib/providers/financing/financing-provider'
import { getSessionUser } from '@/lib/auth/session'

const ORDER_STATUS_FLOW = [
  'PENDING_PAYMENT',
  'PAID',
  'ACCEPTED',
  'PREPARING',
  'READY',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'COMPLETED',
] as const

type OrderStatus = (typeof ORDER_STATUS_FLOW)[number] | 'CANCELLED'

const CANCELLABLE = new Set(['PENDING_PAYMENT', 'PAID', 'ACCEPTED'])

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  if (from === to) return false
  if (from === 'CANCELLED') return false
  if (to === 'CANCELLED') return CANCELLABLE.has(from)
  const fromIndex = ORDER_STATUS_FLOW.indexOf(from)
  const toIndex = ORDER_STATUS_FLOW.indexOf(to)
  return toIndex === fromIndex + 1
}

export async function createOrder(input: {
  items: Array<{ produceId: string; quantity: number }>
  deliveryFee?: number
}) {
  const session = await getSessionUser()
  if (!session) throw new AppError('AUTH_REQUIRED', 'Authentication required', 401)
  if (session.role !== 'CONSUMER') throw new AppError('FORBIDDEN', 'Only consumers can create orders', 403)

  const produceIds = input.items.map((item) => item.produceId)
  const produce = await prisma.produce.findMany({
    where: { id: { in: produceIds }, status: { in: ['LISTED', 'SCANNED'] } },
  })
  if (produce.length !== new Set(produceIds).size) {
    throw new AppError('PRODUCE_UNAVAILABLE', 'One or more produce items are unavailable', 400)
  }

  const farmerIds = new Set(produce.map((p) => p.farmerId))
  if (farmerIds.size !== 1) {
    throw new AppError('MULTI_FARMER_ORDER', 'Orders can only contain produce from one farmer', 400)
  }

  const items = input.items.map((item) => {
    const listing = produce.find((p) => p.id === item.produceId)!
    if (item.quantity > listing.quantity) {
      throw new AppError('INSUFFICIENT_STOCK', `Only ${listing.quantity} ${listing.unit} of ${listing.name} available`, 400)
    }
    return { produceId: listing.id, quantity: item.quantity, unitPrice: listing.price, total: listing.price * item.quantity }
  })

  const subtotal = items.reduce((sum, item) => sum + item.total, 0)
  const deliveryFee = input.deliveryFee ?? 0
  const total = subtotal + deliveryFee
  const reference = `HVL-ORD-${Date.now().toString().slice(-6)}`

  return prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        reference,
        consumerId: session.id,
        farmerId: Array.from(farmerIds)[0],
        subtotal,
        deliveryFee,
        total,
        items: { create: items },
      },
      include: { items: true },
    })
    for (const item of items) {
      await tx.produce.update({
        where: { id: item.produceId },
        data: { quantity: { decrement: item.quantity } },
      })
    }
    logger.info('ORDER_CREATED', { orderId: order.id, total })
    return order
  })
}

export async function getOrderForConsumer(orderId: string) {
  const session = await getSessionUser()
  if (!session) throw new AppError('AUTH_REQUIRED', 'Authentication required', 401)
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { produce: true } }, payment: true, farmer: true },
  })
  if (!order) throw new AppError('ORDER_NOT_FOUND', 'Order not found', 404)
  if (order.consumerId !== session.id && order.farmerId !== (session.farmerId ?? '')) {
    throw new AppError('FORBIDDEN', 'You do not have access to this order', 403)
  }
  return order
}

export async function updateOrderStatus(orderId: string, to: OrderStatus) {
  const session = await getSessionUser()
  if (!session) throw new AppError('AUTH_REQUIRED', 'Authentication required', 401)

  const order = await prisma.order.findUnique({ where: { id: orderId } })
  if (!order) throw new AppError('ORDER_NOT_FOUND', 'Order not found', 404)

  const isFarmer = session.farmerId === order.farmerId
  const isConsumerConfirmingReceipt = session.id === order.consumerId && order.status === 'DELIVERED' && to === 'COMPLETED'
  if (!isFarmer && !isConsumerConfirmingReceipt) {
    throw new AppError('FORBIDDEN', 'Only the farmer can update order status, or the consumer can confirm receipt', 403)
  }
  if (order.status === 'COMPLETED' || order.status === 'CANCELLED') {
    throw new AppError('ORDER_TERMINAL', 'This order has already reached a terminal state', 400)
  }
  if (!canTransition(order.status as OrderStatus, to)) {
    throw new AppError('ORDER_INVALID_STATE', `Cannot move order from ${order.status} to ${to}`, 400)
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status: to, completedAt: to === 'COMPLETED' ? new Date() : undefined },
  })

  if (to === 'COMPLETED') {
    await completeOrder(orderId)
  }
  return updated
}

export async function completeOrder(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } })
  if (!order) throw new AppError('ORDER_NOT_FOUND', 'Order not found', 404)
  if (order.status !== 'COMPLETED') {
    await prisma.order.update({ where: { id: orderId }, data: { status: 'COMPLETED', completedAt: new Date() } })
  }
  logger.info('ORDER_COMPLETED', { orderId, farmerId: order.farmerId })
  await recalculateFinancialPassport(order.farmerId)
  logger.info('PASSPORT_RECALCULATED', { farmerId: order.farmerId })
  await syncWemaOpportunities(order.farmerId)
  logger.info('OPPORTUNITIES_SYNCED', { farmerId: order.farmerId })
}

export async function initializePayment(orderId: string) {
  const session = await getSessionUser()
  if (!session) throw new AppError('AUTH_REQUIRED', 'Authentication required', 401)

  const order = await prisma.order.findUnique({ where: { id: orderId } })
  if (!order) throw new AppError('ORDER_NOT_FOUND', 'Order not found', 404)
  if (order.consumerId !== session.id) throw new AppError('FORBIDDEN', 'Only the buyer can pay for this order', 403)
  if (order.status !== 'PENDING_PAYMENT') throw new AppError('ORDER_INVALID_STATE', 'Order is not awaiting payment', 400)

  const provider = getPaymentProvider()
  const initialization = await provider.initializePayment({
    orderId: order.id,
    amount: order.total,
    consumerEmail: session.email,
  })

  await prisma.payment.upsert({
    where: { orderId: order.id },
    create: {
      orderId: order.id,
      provider: provider.name,
      reference: initialization.reference,
      amount: order.total,
      status: 'INITIATED',
    },
    update: {
      reference: initialization.reference,
      provider: provider.name,
      status: 'INITIATED',
    },
  })

  return initialization
}

export async function verifyPayment(reference: string) {
  const provider = getPaymentProvider()
  const verification = await provider.verifyPayment(reference)

  const payment = await prisma.payment.findUnique({ where: { reference } })
  if (!payment) throw new AppError('PAYMENT_NOT_FOUND', 'Payment record not found', 404)

  if (verification.status === 'SUCCESS') {
    const order = await prisma.$transaction(async (tx) => {
      const updated = await tx.payment.update({ where: { id: payment.id }, data: { status: 'SUCCESS' } })
      await tx.order.update({
        where: { id: payment.orderId },
        data: { paymentStatus: 'SUCCESS', status: 'PAID' },
      })
      return updated
    })
    logger.info('PAYMENT_SUCCESS', { orderId: payment.orderId, reference })
    return { payment: order, orderStatus: 'PAID' as const }
  }

  await prisma.payment.update({ where: { id: payment.id }, data: { status: 'FAILED' } })
  throw new AppError('PAYMENT_FAILED', 'Payment verification failed', 400)
}

export async function createReview(input: { orderId: string; rating: number; comment?: string }) {
  const session = await getSessionUser()
  if (!session) throw new AppError('AUTH_REQUIRED', 'Authentication required', 401)

  const order = await prisma.order.findUnique({ where: { id: input.orderId } })
  if (!order) throw new AppError('ORDER_NOT_FOUND', 'Order not found', 404)
  if (order.consumerId !== session.id) throw new AppError('FORBIDDEN', 'Only the buyer can review this order', 403)
  if (order.status !== 'COMPLETED') throw new AppError('ORDER_NOT_COMPLETED', 'Orders can only be reviewed after completion', 400)

  const existing = await prisma.review.findFirst({ where: { orderId: order.id } })
  if (existing) throw new AppError('REVIEW_EXISTS', 'This order has already been reviewed', 400)

  const review = await prisma.review.create({
    data: {
      orderId: order.id,
      farmerId: order.farmerId,
      consumerId: session.id,
      rating: input.rating,
      comment: input.comment,
    },
  })
  logger.info('REVIEW_SUBMITTED', { orderId: order.id, farmerId: order.farmerId })
  await recalculateFinancialPassport(order.farmerId)
  return review
}

export async function createFinanceRequest(input: { orderId: string; requestedAmount: number; purpose?: string }) {
  const session = await getSessionUser()
  if (!session) throw new AppError('AUTH_REQUIRED', 'Authentication required', 401)

  const order = await prisma.order.findUnique({ where: { id: input.orderId } })
  if (!order) throw new AppError('ORDER_NOT_FOUND', 'Order not found', 404)
  if (session.farmerId !== order.farmerId) throw new AppError('FORBIDDEN', 'Only the farmer can request financing', 403)
  if (order.status === 'PENDING_PAYMENT') throw new AppError('ORDER_NOT_CONFIRMED', 'Only confirmed orders can be financed', 400)

  const maxRequest = order.total * 0.4
  if (input.requestedAmount > maxRequest) {
    throw new AppError(
      'FINANCE_AMOUNT_EXCEEDS_LIMIT',
      `Requested amount exceeds the prototype cap of 40% of order value (₦${maxRequest.toLocaleString()})`,
      400,
    )
  }

  const activeConsent = await prisma.consent.findFirst({
    where: { farmerId: order.farmerId, status: 'GRANTED', revokedAt: null },
  })
  if (!activeConsent) throw new AppError('CONSENT_REQUIRED', 'Wema consent is required before requesting financing', 403)

  const provider = getFinancingProvider()
  const result = await provider.submitFinanceRequest({
    farmerId: order.farmerId,
    orderId: order.id,
    requestedAmount: input.requestedAmount,
    purpose: input.purpose,
  })

  const request = await prisma.financeRequest.create({
    data: {
      farmerId: order.farmerId,
      orderId: order.id,
      requestedAmount: input.requestedAmount,
      purpose: input.purpose,
      status: result.status === 'SUBMITTED' ? 'SUBMITTED' : 'UNDER_REVIEW',
    },
  })
  logger.info('FINANCE_REQUEST_CREATED', { financeRequestId: request.id, farmerId: order.farmerId })
  await syncWemaOpportunities(order.farmerId)
  return { request, message: result.message }
}