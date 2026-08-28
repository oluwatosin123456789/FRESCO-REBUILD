import { z } from 'zod'

// ── Produce (PRD FR-003) ────────────────────────────────────────────────

export const CreateProduceSchema = z.object({
  name: z.string().trim().min(2).max(80),
  category: z.string().trim().min(2).max(40),
  quantity: z.number().int().positive().max(1_000_000),
  unit: z.string().trim().min(1).max(20),
  price: z.number().nonnegative().max(100_000_000),
  location: z.string().trim().min(2).max(120).optional(),
  description: z.string().trim().max(1000).optional(),
  imageUrl: z.string().url().optional(),
  frescoScanId: z.string().uuid().optional(),
})

export const UpdateProduceSchema = CreateProduceSchema.partial()

// ── Orders (PRD FR-010) ─────────────────────────────────────────────────

export const OrderItemInput = z.object({
  produceId: z.string().uuid(),
  quantity: z.number().int().positive().max(1_000_000),
})

export const CreateOrderSchema = z.object({
  items: z.array(OrderItemInput).min(1).max(50),
  deliveryFee: z.number().nonnegative().max(10_000_000).optional(),
})

export const OrderStatusSchema = z.enum([
  'PAID',
  'ACCEPTED',
  'PREPARING',
  'READY',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'COMPLETED',
  'CANCELLED',
])

// ── Payments (PRD FR-009, Architecture §18) ─────────────────────────────

export const PaymentInitializeSchema = z.object({
  orderId: z.string().uuid(),
})

export const PaymentVerifySchema = z.object({
  reference: z.string().trim().min(3).max(120),
})

// ── Reviews (PRD FR-012) ────────────────────────────────────────────────

export const CreateReviewSchema = z.object({
  orderId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional(),
})

// ── Fresco (PRD FR-004) ─────────────────────────────────────────────────

export const FrescoAnalyzeSchema = z.object({
  produceId: z.string().uuid().optional(),
  imageUrl: z.string().url(),
  hint: z.string().trim().max(80).optional(),
})

// ── Consent (PRD FR-018) ────────────────────────────────────────────────

export const ConsentScopeEnum = z.enum([
  'TRANSACTION_HISTORY',
  'REVENUE_HISTORY',
  'FULFILLMENT_HISTORY',
  'QUALITY_HISTORY',
  'CUSTOMER_REPUTATION',
  'FEAP',
  'PROFILE_MATURITY',
])

export const CreateConsentSchema = z.object({
  scopes: z.array(ConsentScopeEnum).min(1),
  institution: z.string().trim().min(2).max(80).default('Wema Bank'),
})

export const RevokeConsentSchema = z.object({
  consentId: z.string().uuid(),
})

// ── Finance My Order (PRD FR-022, Architecture §14) ─────────────────────

export const CreateFinanceRequestSchema = z.object({
  orderId: z.string().uuid(),
  requestedAmount: z.number().positive().max(500_000_000),
  purpose: z.string().trim().max(300).optional(),
})

// ── AI Coach (PRD FR-023) ───────────────────────────────────────────────

export const FarmerCoachInputSchema = z.object({
  farmerId: z.string().uuid(),
})