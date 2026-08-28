// Consent domain service (PRD FR-018, Essentials §17, Architecture §15, ADR-007)
// Wema may only view data covered by an active consent record.

import { prisma } from '@/lib/db'
import { AppError } from '@/lib/api'
import { logger } from '@/lib/logger'
import { getSessionUser } from '@/lib/auth/session'
import type { ConsentScope } from '@/lib/generated/prisma/enums'

export async function createConsent(input: { scopes: ConsentScope[]; institution?: string }) {
  const session = await getSessionUser()
  if (!session) throw new AppError('AUTH_REQUIRED', 'Authentication required', 401)
  if (!session.farmerId) throw new AppError('FARMER_PROFILE_REQUIRED', 'A farmer profile is required to grant consent', 400)

  const existing = await prisma.consent.findFirst({
    where: { farmerId: session.farmerId, institution: input.institution ?? 'Wema Bank', status: 'GRANTED', revokedAt: null },
  })
  if (existing) {
    return prisma.consent.update({
      where: { id: existing.id },
      data: { scopes: input.scopes, grantedAt: new Date() },
    })
  }

  const consent = await prisma.consent.create({
    data: {
      farmerId: session.farmerId,
      institution: input.institution ?? 'Wema Bank',
      scopes: input.scopes,
      status: 'GRANTED',
      grantedAt: new Date(),
    },
  })
  logger.info('CONSENT_GRANTED', { farmerId: session.farmerId, consentId: consent.id })
  return consent
}

export async function revokeConsent(consentId: string) {
  const session = await getSessionUser()
  if (!session) throw new AppError('AUTH_REQUIRED', 'Authentication required', 401)

  const consent = await prisma.consent.findUnique({ where: { id: consentId } })
  if (!consent) throw new AppError('CONSENT_NOT_FOUND', 'Consent record not found', 404)
  if (consent.farmerId !== session.farmerId) throw new AppError('FORBIDDEN', 'You can only revoke your own consent', 403)

  const revoked = await prisma.consent.update({
    where: { id: consentId },
    data: { status: 'REVOKED', revokedAt: new Date() },
  })
  logger.info('CONSENT_REVOKED', { farmerId: session.farmerId, consentId })
  return revoked
}

export async function getConsents(farmerId?: string) {
  const session = await getSessionUser()
  if (!session) throw new AppError('AUTH_REQUIRED', 'Authentication required', 401)

  const where =
    farmerId && (session.wemaAnalyst || session.farmerId === farmerId)
      ? { farmerId }
      : { farmerId: session.farmerId }

  return prisma.consent.findMany({
    where: { ...where, status: { in: ['GRANTED', 'REVOKED'] } },
    orderBy: { createdAt: 'desc' },
  })
}

export async function hasActiveConsent(farmerId: string, institution = 'Wema Bank'): Promise<boolean> {
  const consent = await prisma.consent.findFirst({
    where: { farmerId, institution, status: 'GRANTED', revokedAt: null },
  })
  return Boolean(consent)
}