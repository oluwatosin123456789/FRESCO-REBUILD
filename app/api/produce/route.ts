// GET /api/produce · public marketplace listings
// POST /api/produce · farmer creates produce

import { handle, unauthorized } from '@/lib/api-helpers'
import { CreateProduceSchema } from '@/lib/validation/schemas'
import { createProduce, getMarketplace } from '@/lib/domain/marketplace/produce.service'
import { getSessionUser } from '@/lib/auth/session'

export async function GET(request: Request) {
  return handle(async () => {
    const url = new URL(request.url)
    return getMarketplace({
      search: url.searchParams.get('search') ?? undefined,
      category: url.searchParams.get('category') ?? undefined,
      verifiedOnly: url.searchParams.get('verified') === 'true',
      latitude: url.searchParams.get('lat') ? Number(url.searchParams.get('lat')) : undefined,
      longitude: url.searchParams.get('lng') ? Number(url.searchParams.get('lng')) : undefined,
    })
  })
}

export async function POST(request: Request) {
  const session = await getSessionUser()
  if (!session) return unauthorized()
  return handle(async () => {
    const input = CreateProduceSchema.parse(await request.json())
    return createProduce(input)
  })
}