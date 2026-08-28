// Fresco domain service (PRD FR-004/025, Architecture §16, Claude §15)
// Normalizes provider output, persists ProduceScan, feeds quality history.
// Fresco never makes financial decisions.

import { prisma } from '@/lib/db'
import { AppError } from '@/lib/api'
import { logger } from '@/lib/logger'
import { getFrescoProvider } from '@/lib/providers/fresco/fresco-provider'
import { getSessionUser } from '@/lib/auth/session'

export async function analyzeProduce(input: { produceId?: string; imageUrl: string; hint?: string }) {
  const session = await getSessionUser()
  if (!session) throw new AppError('AUTH_REQUIRED', 'Authentication required', 401)
  if (!session.farmerId) throw new AppError('FARMER_PROFILE_REQUIRED', 'A farmer profile is required to scan produce', 400)

  const produceId = input.produceId
  if (produceId) {
    const produce = await prisma.produce.findUnique({ where: { id: produceId } })
    if (!produce) throw new AppError('PRODUCE_NOT_FOUND', 'Produce not found', 404)
    if (produce.farmerId !== session.farmerId) throw new AppError('FORBIDDEN', 'You can only scan your own produce', 403)
  }

  const provider = getFrescoProvider()
  logger.info('FRESCO_ANALYSIS_STARTED', { provider: provider.name })
  let analysis
  try {
    analysis = await provider.analyze({ imageUrl: input.imageUrl, hint: input.hint })
  } catch (error) {
    logger.warn('FRESCO_ANALYSIS_FAILED', { error: error instanceof Error ? error.message : 'unknown' })
    analysis = await getFrescoProvider().analyze({ imageUrl: input.imageUrl, hint: input.hint })
  }
  logger.info('FRESCO_ANALYSIS_COMPLETED', { provider: analysis.provider, isFallback: analysis.isFallback })

  const scan = await prisma.produceScan.create({
    data: {
      produceId,
      farmerId: session.farmerId,
      imageUrl: input.imageUrl,
      detectedProduce: analysis.produceType,
      freshnessScore: analysis.freshnessScore,
      estimatedShelfLifeDays: analysis.estimatedShelfLifeDays,
      confidence: analysis.confidence,
      qualityLabel: analysis.qualityLabel,
      analysisSummary: analysis.analysisSummary,
      provider: analysis.provider,
    },
  })

  if (produceId) {
    await prisma.produce.update({
      where: { id: produceId },
      data: { status: 'SCANNED', frescoScanId: scan.id },
    })
  }

  return { scan, analysis }
}

export async function getQualityConsistency(farmerId: string): Promise<number> {
  const scans = await prisma.produceScan.findMany({
    where: { farmerId },
    select: { freshnessScore: true },
  })
  if (scans.length === 0) return 0
  const average = scans.reduce((sum, scan) => sum + scan.freshnessScore, 0) / scans.length
  return Math.round(average * 10) / 10
}