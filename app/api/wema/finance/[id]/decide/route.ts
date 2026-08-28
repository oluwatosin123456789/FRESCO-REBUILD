// POST /api/wema/finance/[id]/decide · Wema analyst demo decision (no real underwriting)

import { handle, unauthorized } from '@/lib/api-helpers'
import { getSessionUser } from '@/lib/auth/session'
import { prisma } from '@/lib/db'

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getSessionUser()
  if (!session) return unauthorized()
  if (!session.wemaAnalyst) return new Response(JSON.stringify({ success: false, error: { code: 'FORBIDDEN', message: 'Wema analyst role required' } }), { status: 403 })

  return handle(async () => {
    const { id } = await context.params
    const body = (await request.json().catch(() => ({}))) as { approved?: boolean }
    if (typeof body.approved !== 'boolean') throw new Error('approved is required')

    const updated = await prisma.financeRequest.update({
      where: { id },
      data: { status: body.approved ? 'APPROVED' : 'DECLINED' },
    })
    return updated
  })
}