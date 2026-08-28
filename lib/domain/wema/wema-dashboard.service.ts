// Wema dashboard service (PRD FR-019/020, Architecture §23)
// Wema views only farmers with active consent.

import { prisma } from '@/lib/db'
import { AppError } from '@/lib/api'
import { getSessionUser } from '@/lib/auth/session'
import { getFinancialPassport } from '@/lib/domain/passport/passport.service'
import { hasActiveConsent } from '@/lib/domain/consent/consent.service'
import { getWemaOpportunities } from '@/lib/domain/finance/opportunity.service'

export async function getWemaFarmerList(input: { search?: string }) {
  const session = await getSessionUser()
  if (!session) throw new AppError('AUTH_REQUIRED', 'Authentication required', 401)
  if (!session.wemaAnalyst) throw new AppError('FORBIDDEN', 'Wema analyst role required', 403)

  const farmers = await prisma.farmerProfile.findMany({
    where: input.search
      ? {
          OR: [
            { farmName: { contains: input.search, mode: 'insensitive' } },
            { location: { contains: input.search, mode: 'insensitive' } },
            { primaryProduce: { contains: input.search, mode: 'insensitive' } },
            { user: { name: { contains: input.search, mode: 'insensitive' } } },
          ],
        }
      : undefined,
    include: {
      user: { select: { name: true, email: true } },
      passport: true,
      consents: { where: { status: 'GRANTED', revokedAt: null }, select: { scopes: true, grantedAt: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return farmers.map((farmer) => ({
    id: farmer.id,
    farmName: farmer.farmName,
    farmerName: farmer.user.name,
    location: farmer.location,
    primaryProduce: farmer.primaryProduce,
    consented: farmer.consents.length > 0,
    consentScopes: farmer.consents.flatMap((c) => c.scopes),
    feap: farmer.passport?.feap ?? 0,
    profileMaturity: farmer.passport?.profileMaturity ?? 0,
    lifetimeRevenue: farmer.passport?.lifetimeRevenue ?? 0,
  }))
}

export async function getWemaFarmerProfile(farmerId: string) {
  const session = await getSessionUser()
  if (!session) throw new AppError('AUTH_REQUIRED', 'Authentication required', 401)
  if (!session.wemaAnalyst) throw new AppError('FORBIDDEN', 'Wema analyst role required', 403)

  const consented = await hasActiveConsent(farmerId)
  if (!consented) {
    throw new AppError('CONSENT_REQUIRED', 'This farmer has not granted consent. Access is denied.', 403)
  }

  const [farmer, passport, reviews, scans, orders, opportunities] = await Promise.all([
    prisma.farmerProfile.findUnique({
      where: { id: farmerId },
      include: { user: { select: { name: true, email: true } }, consents: true },
    }),
    getFinancialPassport(farmerId),
    prisma.review.findMany({ where: { farmerId }, select: { rating: true, comment: true, createdAt: true } }),
    prisma.produceScan.findMany({
      where: { farmerId },
      select: { detectedProduce: true, freshnessScore: true, qualityLabel: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.order.findMany({
      where: { farmerId },
      select: { reference: true, status: true, total: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    getWemaOpportunities(farmerId),
  ])

  if (!farmer) throw new AppError('FARMER_NOT_FOUND', 'Farmer not found', 404)

  return {
    identity: {
      name: farmer.user.name,
      farmName: farmer.farmName,
      location: farmer.location,
      primaryProduce: farmer.primaryProduce,
      profileImage: farmer.profileImage,
    },
    passport,
    reviews,
    scans,
    recentOrders: orders,
    opportunities,
    consent: farmer.consents.map((c) => ({
      status: c.status,
      scopes: c.scopes,
      grantedAt: c.grantedAt,
      revokedAt: c.revokedAt,
    })),
  }
}