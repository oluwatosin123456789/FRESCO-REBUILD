// Financial Passport service (PRD FR-013/014/017, Architecture §10, Claude §10)
// Aggregates verified business records · never manually editable through UI.

import { prisma } from '@/lib/db'
import { calculateFeap, feapExplanation, normalizeScore } from '@/lib/domain/passport/feap'
import { calculateProfileMaturity, maturityTier } from '@/lib/domain/passport/maturity'

const RECENT_WINDOW_DAYS = 90

export type PassportTimelineEntry = {
  type: 'ORDER_COMPLETED' | 'PAYMENT_SUCCESS' | 'REVIEW_SUBMITTED' | 'QUALITY_SCAN' | 'LISTING_CREATED'
  label: string
  occurredAt: Date
  value?: number
}

export type PassportMetrics = {
  lifetimeRevenue: number
  recentRevenue: number
  transactionCount: number
  completedOrders: number
  fulfillmentRate: number
  customerCount: number
  repeatCustomerCount: number
  averageRating: number
  qualityConsistency: number
  activeMonths: number
  feap: number
  profileMaturity: number
  updatedAt: Date
  feapExplanation: ReturnType<typeof feapExplanation>
  maturityTier: string
}

function safeDivide(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : numerator / denominator
}

export async function getFinancialPassport(farmerId: string): Promise<PassportMetrics> {
  const [completedOrders, allOrders, reviews, scans, farmer, passport] = await Promise.all([
    prisma.order.count({ where: { farmerId, status: 'COMPLETED' } }),
    prisma.order.findMany({
      where: { farmerId },
      select: { id: true, total: true, status: true, createdAt: true, consumerId: true, completedAt: true },
    }),
    prisma.review.findMany({
      where: { farmerId },
      select: { rating: true, consumerId: true },
    }),
    prisma.produceScan.findMany({
      where: { farmerId },
      select: { freshnessScore: true, createdAt: true },
    }),
    prisma.farmerProfile.findUnique({
      where: { id: farmerId },
      select: { farmName: true, primaryProduce: true, location: true, latitude: true, longitude: true, profileImage: true },
    }),
    prisma.financialPassport.findUnique({ where: { farmerId } }),
  ])

  const completed = allOrders.filter((o) => o.status === 'COMPLETED')
  const activeOrderCount = allOrders.filter((o) => o.status !== 'PENDING_PAYMENT' && o.status !== 'CANCELLED').length

  const lifetimeRevenue = completed.reduce((sum, o) => sum + o.total, 0)
  const recentCutoff = new Date(Date.now() - RECENT_WINDOW_DAYS * 24 * 60 * 60 * 1000)
  const recentRevenue = completed
    .filter((o) => o.completedAt && o.completedAt >= recentCutoff)
    .reduce((sum, o) => sum + o.total, 0)

  const fulfillmentRate = Math.round(safeDivide(completedOrders, activeOrderCount) * 100)

  const customerIds = new Set(allOrders.map((o) => o.consumerId))
  const repeatCustomerCount = allOrders.reduce<Map<string, number>>((counts, o) => {
    counts.set(o.consumerId, (counts.get(o.consumerId) ?? 0) + 1)
    return counts
  }, new Map())
  const repeatCustomers = Array.from(repeatCustomerCount.values()).filter((count) => count >= 2).length

  const averageRating = reviews.length
    ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
    : 0

  const qualityScores = scans.map((s) => s.freshnessScore)
  const qualityConsistency = qualityScores.length
    ? Math.round((qualityScores.reduce((sum, q) => sum + q, 0) / qualityScores.length) * 10) / 10
    : 0

  const firstOrderAt = allOrders.reduce<Date | null>((earliest, o) => {
    if (!earliest || o.createdAt < earliest) return o.createdAt
    return earliest
  }, null)
  const activeMonths = firstOrderAt
    ? Math.max(1, Math.round((Date.now() - firstOrderAt.getTime()) / (30.44 * 24 * 60 * 60 * 1000)))
    : farmer && passport ? passport.activeMonths : 0

  const transactionScore = normalizeScore(Math.min(100, allOrders.length * 4))
  const revenueScore = normalizeScore(Math.min(100, Math.log10(1 + lifetimeRevenue) * 8))
  const fulfillmentScore = normalizeScore(fulfillmentRate)
  const reputationScore = normalizeScore(averageRating * 20)
  const qualityScore = normalizeScore(qualityConsistency)
  const longevityScore = normalizeScore(Math.min(100, activeMonths * 5))

  const feap = calculateFeap({
    transactionConsistency: transactionScore,
    revenueConsistency: revenueScore,
    fulfillmentReliability: fulfillmentScore,
    customerReputation: reputationScore,
    qualityConsistency: qualityScore,
    businessLongevity: longevityScore,
  })

  const profileMaturity = calculateProfileMaturity({
    identityCompleteness: farmer ? 100 : 40,
    verifiedTransactions: transactionScore,
    activityDuration: longevityScore,
    fulfillmentHistory: fulfillmentScore,
    customerFeedback: reputationScore,
    produceQualityHistory: qualityScore,
  })

  return {
    lifetimeRevenue,
    recentRevenue,
    transactionCount: allOrders.length,
    completedOrders,
    fulfillmentRate,
    customerCount: customerIds.size,
    repeatCustomerCount: repeatCustomers,
    averageRating,
    qualityConsistency,
    activeMonths,
    feap,
    profileMaturity,
    updatedAt: new Date(),
    feapExplanation: feapExplanation(
      {
        transactionConsistency: transactionScore,
        revenueConsistency: revenueScore,
        fulfillmentReliability: fulfillmentScore,
        customerReputation: reputationScore,
        qualityConsistency: qualityScore,
        businessLongevity: longevityScore,
      },
      feap,
    ),
    maturityTier: maturityTier(profileMaturity),
  }
}

export async function recalculateFinancialPassport(farmerId: string) {
  const metrics = await getFinancialPassport(farmerId)
  const saved = await prisma.financialPassport.upsert({
    where: { farmerId },
    create: {
      farmerId,
      lifetimeRevenue: metrics.lifetimeRevenue,
      recentRevenue: metrics.recentRevenue,
      transactionCount: metrics.transactionCount,
      completedOrders: metrics.completedOrders,
      fulfillmentRate: metrics.fulfillmentRate,
      customerCount: metrics.customerCount,
      repeatCustomerCount: metrics.repeatCustomerCount,
      averageRating: metrics.averageRating,
      qualityConsistency: metrics.qualityConsistency,
      activeMonths: metrics.activeMonths,
      feap: metrics.feap,
      profileMaturity: metrics.profileMaturity,
    },
    update: {
      lifetimeRevenue: metrics.lifetimeRevenue,
      recentRevenue: metrics.recentRevenue,
      transactionCount: metrics.transactionCount,
      completedOrders: metrics.completedOrders,
      fulfillmentRate: metrics.fulfillmentRate,
      customerCount: metrics.customerCount,
      repeatCustomerCount: metrics.repeatCustomerCount,
      averageRating: metrics.averageRating,
      qualityConsistency: metrics.qualityConsistency,
      activeMonths: metrics.activeMonths,
      feap: metrics.feap,
      profileMaturity: metrics.profileMaturity,
    },
  })
  return { metrics, saved }
}

export async function getPassportTimeline(farmerId: string, limit = 12): Promise<PassportTimelineEntry[]> {
  const [orders, payments, reviews, scans, produce] = await Promise.all([
    prisma.order.findMany({
      where: { farmerId },
      select: { id: true, status: true, completedAt: true, createdAt: true, total: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.payment.findMany({
      where: { order: { farmerId } },
      select: { createdAt: true, amount: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.review.findMany({
      where: { farmerId },
      select: { createdAt: true, rating: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.produceScan.findMany({
      where: { farmerId },
      select: { createdAt: true, detectedProduce: true, freshnessScore: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.produce.findMany({
      where: { farmerId },
      select: { createdAt: true, name: true },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  const entries: PassportTimelineEntry[] = [
    ...orders.map((o) => ({
      type: 'ORDER_COMPLETED' as const,
      label: o.status === 'COMPLETED' ? `Order completed · ₦${o.total.toLocaleString()}` : `Order placed · ₦${o.total.toLocaleString()}`,
      occurredAt: o.completedAt ?? o.createdAt,
      value: o.total,
    })),
    ...payments.map((p) => ({
      type: 'PAYMENT_SUCCESS' as const,
      label: `₦${p.amount.toLocaleString()} payment recorded`,
      occurredAt: p.createdAt,
      value: p.amount,
    })),
    ...reviews.map((r) => ({
      type: 'REVIEW_SUBMITTED' as const,
      label: `${r.rating}-star review received`,
      occurredAt: r.createdAt,
    })),
    ...scans.map((s) => ({
      type: 'QUALITY_SCAN' as const,
      label: `${s.detectedProduce} scanned · ${s.freshnessScore}% freshness`,
      occurredAt: s.createdAt,
    })),
    ...produce.map((p) => ({
      type: 'LISTING_CREATED' as const,
      label: `${p.name} listing created`,
      occurredAt: p.createdAt,
    })),
  ]

  return entries.sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime()).slice(0, limit)
}