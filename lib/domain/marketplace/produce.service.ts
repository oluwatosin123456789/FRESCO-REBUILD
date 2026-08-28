// Produce + marketplace domain service (PRD FR-003/005/006/007, Architecture §24)

import { prisma } from '@/lib/db'
import { AppError } from '@/lib/api'
import { logger } from '@/lib/logger'
import { getSessionUser } from '@/lib/auth/session'

const EARTH_RADIUS_KM = 6371

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a))
}

export async function createProduce(input: {
  name: string
  category: string
  quantity: number
  unit: string
  price: number
  description?: string
  imageUrl?: string
  frescoScanId?: string
}) {
  const session = await getSessionUser()
  if (!session) throw new AppError('AUTH_REQUIRED', 'Authentication required', 401)
  if (session.role !== 'FARMER') throw new AppError('FORBIDDEN', 'Only farmers can create produce', 403)
  if (!session.farmerId) throw new AppError('FARMER_PROFILE_REQUIRED', 'A farmer profile is required', 400)

  const listingNumber = String(Date.now()).slice(-6)
  const produce = await prisma.produce.create({
    data: {
      farmerId: session.farmerId,
      name: input.name,
      category: input.category,
      quantity: input.quantity,
      unit: input.unit,
      price: input.price,
      description: input.description,
      imageUrl: input.imageUrl,
      frescoScanId: input.frescoScanId,
      status: 'DRAFT',
      batchId: `${input.category.slice(0, 3).toUpperCase()}-2026-${listingNumber}`,
    },
  })
  logger.info('PRODUCE_CREATED', { produceId: produce.id })
  return produce
}

export async function listProduce(produceId: string) {
  const session = await getSessionUser()
  if (!session) throw new AppError('AUTH_REQUIRED', 'Authentication required', 401)
  if (!session.farmerId) throw new AppError('FARMER_PROFILE_REQUIRED', 'A farmer profile is required', 400)

  const produce = await prisma.produce.findUnique({ where: { id: produceId } })
  if (!produce) throw new AppError('PRODUCE_NOT_FOUND', 'Produce not found', 404)
  if (produce.farmerId !== session.farmerId) throw new AppError('FORBIDDEN', 'You can only list your own produce', 403)
  if (produce.quantity <= 0) throw new AppError('NO_STOCK', 'Cannot list produce with zero quantity', 400)

  const updated = await prisma.produce.update({
    where: { id: produceId },
    data: { status: 'LISTED' },
  })
  logger.info('PRODUCE_LISTED', { produceId })
  return updated
}

export async function getMarketplace(input: { search?: string; category?: string; verifiedOnly?: boolean; latitude?: number; longitude?: number }) {
  const produce = await prisma.produce.findMany({
    where: {
      status: 'LISTED',
      ...(input.category ? { category: input.category } : {}),
      ...(input.verifiedOnly ? { frescoScanId: { not: null } } : {}),
      ...(input.search
        ? {
            OR: [
              { name: { contains: input.search, mode: 'insensitive' } },
              { description: { contains: input.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    include: {
      farmer: { select: { farmName: true, location: true, latitude: true, longitude: true, primaryProduce: true } },
      frescoScan: { select: { freshnessScore: true, estimatedShelfLifeDays: true, qualityLabel: true, createdAt: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return produce.map((item) => {
    const distance =
      input.latitude && input.longitude && item.farmer.latitude && item.farmer.longitude
        ? haversineKm(input.latitude, input.longitude, item.farmer.latitude, item.farmer.longitude)
        : null
    return {
      ...item,
      farmName: item.farmer.farmName,
      location: item.farmer.location,
      primaryProduce: item.farmer.primaryProduce,
      distanceKm: distance,
      verified: Boolean(item.frescoScanId),
    }
  })
}

export async function getProduceDetail(produceId: string) {
  const produce = await prisma.produce.findUnique({
    where: { id: produceId },
    include: {
      farmer: { select: { farmName: true, location: true, latitude: true, longitude: true, primaryProduce: true } },
      frescoScan: true,
    },
  })
  if (!produce) throw new AppError('PRODUCE_NOT_FOUND', 'Produce not found', 404)
  return produce
}

export async function getFarmerProduce(farmerId: string) {
  return prisma.produce.findMany({
    where: { farmerId },
    include: { frescoScan: true },
    orderBy: { createdAt: 'desc' },
  })
}