// POST /api/fresco/analyze · run Fresco analysis, persist ProduceScan

import { handle, unauthorized } from '@/lib/api-helpers'
import { FrescoAnalyzeSchema } from '@/lib/validation/schemas'
import { analyzeProduce } from '@/lib/domain/fresco/fresco.service'
import { getSessionUser } from '@/lib/auth/session'

export async function POST(request: Request) {
  const session = await getSessionUser()
  if (!session) return unauthorized()
  return handle(async () => {
    const input = FrescoAnalyzeSchema.parse(await request.json())
    return analyzeProduce(input)
  })
}