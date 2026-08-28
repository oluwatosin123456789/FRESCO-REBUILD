// AI Coach service (PRD FR-023/024, Architecture §17, Claude §14)
// LLM with deterministic fallback. Never approves or rejects financing.

import { prisma } from '@/lib/db'
import { AppError } from '@/lib/api'
import { getSessionUser } from '@/lib/auth/session'
import { getAIProvider, type FarmerInsight } from '@/lib/providers/ai/ai-provider'
import { getFinancialPassport } from '@/lib/domain/passport/passport.service'

export type DemandInsight = {
  topCategories: Array<{ category: string; count: number }>
  weeklyOrderTrend: number
  demandChangePercent: number
  recommendedDirection: 'increase_inventory' | 'maintain' | 'reduce_inventory'
}

export async function getFarmerInsights(): Promise<FarmerInsight> {
  const session = await getSessionUser()
  if (!session) throw new AppError('AUTH_REQUIRED', 'Authentication required', 401)
  if (!session.farmerId) throw new AppError('FARMER_PROFILE_REQUIRED', 'A farmer profile is required', 400)

  const [farmer, passport, categories] = await Promise.all([
    prisma.farmerProfile.findUnique({
      where: { id: session.farmerId },
      select: { farmName: true },
    }),
    getFinancialPassport(session.farmerId),
    prisma.produce.findMany({
      where: { farmerId: session.farmerId },
      select: { category: true },
      distinct: ['category'],
    }),
  ])

  const provider = getAIProvider()
  try {
    const insight = await provider.generateFarmerInsights({
      farmerName: session.name,
      farmName: farmer?.farmName ?? 'your farm',
      revenue: passport.lifetimeRevenue,
      recentRevenue: passport.recentRevenue,
      salesTrend: passport.recentRevenue > passport.lifetimeRevenue * 0.2 ? 'increasing' : 'stable',
      orderCount: passport.transactionCount,
      fulfillmentRate: passport.fulfillmentRate,
      repeatCustomerCount: passport.repeatCustomerCount,
      qualityConsistency: passport.qualityConsistency,
      produceCategories: categories.map((c) => c.category),
    })
    return insight
  } catch {
    const fallback = new (await import('@/lib/providers/ai/ai-provider')).FallbackAIProvider()
    return fallback.generateFarmerInsights({
      farmerName: session.name,
      farmName: farmer?.farmName ?? 'your farm',
      revenue: passport.lifetimeRevenue,
      recentRevenue: passport.recentRevenue,
      salesTrend: 'stable',
      orderCount: passport.transactionCount,
      fulfillmentRate: passport.fulfillmentRate,
      repeatCustomerCount: passport.repeatCustomerCount,
      qualityConsistency: passport.qualityConsistency,
      produceCategories: categories.map((c) => c.category),
    })
  }
}

export async function getDemandInsight(): Promise<DemandInsight> {
  const session = await getSessionUser()
  if (!session) throw new AppError('AUTH_REQUIRED', 'Authentication required', 401)
  if (!session.farmerId) throw new AppError('FARMER_PROFILE_REQUIRED', 'A farmer profile is required', 400)

  const orders = await prisma.order.findMany({
    where: { farmerId: session.farmerId, status: { in: ['PAID', 'ACCEPTED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED'] } },
    include: { items: { include: { produce: { select: { category: true } } } } },
    orderBy: { createdAt: 'asc' },
  })

  const categoryCounts = new Map<string, number>()
  for (const order of orders) {
    for (const item of order.items) {
      categoryCounts.set(item.produce.category, (categoryCounts.get(item.produce.category) ?? 0) + item.quantity)
    }
  }
  const topCategories = Array.from(categoryCounts.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  const now = Date.now()
  const weekMs = 7 * 24 * 60 * 60 * 1000
  const thisWeek = orders.filter((o) => now - o.createdAt.getTime() <= weekMs).length
  const lastWeek = orders.filter((o) => now - o.createdAt.getTime() > weekMs && now - o.createdAt.getTime() <= 2 * weekMs).length
  const demandChangePercent = lastWeek === 0 ? (thisWeek > 0 ? 100 : 0) : Math.round(((thisWeek - lastWeek) / lastWeek) * 100)

  const recommendedDirection: DemandInsight['recommendedDirection'] =
    demandChangePercent > 15 ? 'increase_inventory' : demandChangePercent < -15 ? 'reduce_inventory' : 'maintain'

  return {
    topCategories,
    weeklyOrderTrend: thisWeek,
    demandChangePercent,
    recommendedDirection,
  }
}