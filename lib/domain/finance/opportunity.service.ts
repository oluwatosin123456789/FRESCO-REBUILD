// Wema Opportunity Engine (PRD FR-021, Architecture §13)
// Deterministic, explainable rules. Never a loan approval engine.

import { prisma } from '@/lib/db'
import type { OpportunityType } from '@/lib/generated/prisma/enums'
import { getFinancialPassport } from '@/lib/domain/passport/passport.service'

export type Opportunity = {
  type: OpportunityType
  recommendedAmount?: number
  rationale: string
  triggerMetrics: string[]
  confidence: 'high' | 'medium'
}

const WORKING_CAPITAL_MIN_ORDERS = 30
const WORKING_CAPITAL_MIN_FULFILLMENT = 90
const WORKING_CAPITAL_MIN_REVENUE = 250_000
const ORDER_FINANCING_RATIO = 0.4

export async function evaluateOpportunities(farmerId: string): Promise<Opportunity[]> {
  const [passport, activeConsent, confirmedOrder] = await Promise.all([
    getFinancialPassport(farmerId),
    prisma.consent.findFirst({
      where: { farmerId, status: 'GRANTED', revokedAt: null },
    }),
    prisma.order.findFirst({
      where: { farmerId, status: { in: ['PAID', 'ACCEPTED', 'PREPARING'] } },
      orderBy: { createdAt: 'desc' },
      select: { id: true, total: true, reference: true },
    }),
  ])

  const opportunities: Opportunity[] = []

  if (
    passport.completedOrders >= WORKING_CAPITAL_MIN_ORDERS &&
    passport.fulfillmentRate >= WORKING_CAPITAL_MIN_FULFILLMENT &&
    passport.recentRevenue > WORKING_CAPITAL_MIN_REVENUE
  ) {
    opportunities.push({
      type: 'WORKING_CAPITAL',
      recommendedAmount: Math.round(passport.recentRevenue * 0.3),
      rationale:
        'Consistent order volume, high fulfillment and recent revenue above threshold indicate a potential working-capital need.',
      triggerMetrics: [
        `Completed orders: ${passport.completedOrders} (>= ${WORKING_CAPITAL_MIN_ORDERS})`,
        `Fulfillment rate: ${passport.fulfillmentRate}% (>= ${WORKING_CAPITAL_MIN_FULFILLMENT}%)`,
        `Recent revenue: ₦${passport.recentRevenue.toLocaleString()} (> ₦${WORKING_CAPITAL_MIN_REVENUE.toLocaleString()})`,
      ],
      confidence: 'high',
    })
  }

  if (passport.profileMaturity >= 70 && passport.activeMonths >= 3) {
    opportunities.push({
      type: 'BUSINESS_ACCOUNT',
      rationale: 'An established activity profile with verified history qualifies for a business account opportunity.',
      triggerMetrics: [
        `Profile maturity: ${passport.profileMaturity} (>= 70)`,
        `Active months: ${passport.activeMonths} (>= 3)`,
      ],
      confidence: 'high',
    })
  }

  if (passport.transactionCount >= 10 && passport.repeatCustomerCount >= 3) {
    opportunities.push({
      type: 'PAYMENT_COLLECTION',
      rationale: 'Recurring transaction flow with returning customers suggests a payment/collection opportunity.',
      triggerMetrics: [
        `Transactions: ${passport.transactionCount} (>= 10)`,
        `Repeat customers: ${passport.repeatCustomerCount} (>= 3)`,
      ],
      confidence: 'medium',
    })
  }

  if (confirmedOrder && activeConsent) {
    opportunities.push({
      type: 'ORDER_FINANCING',
      recommendedAmount: Math.round(confirmedOrder.total * ORDER_FINANCING_RATIO),
      rationale:
        'A confirmed order plus active Wema consent supports a Finance My Order request capped at 40% of order value.',
      triggerMetrics: [
        `Confirmed order ${confirmedOrder.reference}: ₦${confirmedOrder.total.toLocaleString()}`,
        'Active consent on record',
      ],
      confidence: 'medium',
    })
  }

  return opportunities
}

export async function syncWemaOpportunities(farmerId: string) {
  const opportunities = await evaluateOpportunities(farmerId)
  const existing = await prisma.wemaOpportunity.findMany({
    where: { farmerId, status: 'ACTIVE' },
    select: { id: true, type: true },
  })
  const existingTypes = new Set(existing.map((o) => o.type))

  for (const opportunity of opportunities) {
    if (existingTypes.has(opportunity.type)) continue
    await prisma.wemaOpportunity.create({
      data: {
        farmerId,
        type: opportunity.type,
        recommendedAmount: opportunity.recommendedAmount,
        rationale: opportunity.rationale,
        triggerMetrics: opportunity.triggerMetrics.join('; '),
      },
    })
  }
  return opportunities
}

export async function getWemaOpportunities(farmerId?: string) {
  const rows = await prisma.wemaOpportunity.findMany({
    where: {
      ...(farmerId ? { farmerId } : {}),
      status: 'ACTIVE',
    },
    include: {
      farmer: { select: { farmName: true, location: true, primaryProduce: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return rows.map((row) => ({
    ...row,
    triggerMetrics: row.triggerMetrics ? row.triggerMetrics.split('; ') : [],
  }))
}

export async function dismissOpportunity(opportunityId: string, farmerId?: string) {
  return prisma.wemaOpportunity.updateMany({
    where: { id: opportunityId, status: 'ACTIVE', ...(farmerId ? { farmerId } : {}) },
    data: { status: 'DISMISSED' },
  })
}