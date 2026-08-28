// GET /api/wema/summary · Wema dashboard KPIs (consented data only)

import { handle, unauthorized } from '@/lib/api-helpers'
import { getSessionUser } from '@/lib/auth/session'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getSessionUser()
  if (!session) return unauthorized()
  if (!session.wemaAnalyst) return new Response(JSON.stringify({ success: false, error: { code: 'FORBIDDEN', message: 'Wema analyst role required' } }), { status: 403 })

  return handle(async () => {
    const [totalFarmers, consentedFarmers, pendingRequests, approvedRequests, activeOpportunities] = await Promise.all([
      prisma.farmerProfile.count(),
      prisma.consent.count({ where: { institution: 'WEMA_BANK', status: 'GRANTED' } }),
      prisma.financeRequest.count({ where: { status: 'SUBMITTED' } }),
      prisma.financeRequest.findMany({ where: { status: 'APPROVED' }, select: { requestedAmount: true } }),
      prisma.wemaOpportunity.count({ where: { status: 'ACTIVE' } }),
    ])
    return {
      totalFarmers,
      consentedFarmers,
      pendingRequests,
      totalFinancing: approvedRequests.reduce((sum, request) => sum + request.requestedAmount, 0),
      activeOpportunities,
    }
  })
}