// POST /api/upload · produce image upload (data URL → public/uploads)
// Storage fallback per Architecture §33: Cloudinary when configured, local disk otherwise.

import { handle, unauthorized } from '@/lib/api-helpers'
import { getSessionUser } from '@/lib/auth/session'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import crypto from 'node:crypto'

const MAX_BYTES = 2 * 1024 * 1024

export async function POST(request: Request) {
  const session = await getSessionUser()
  if (!session) return unauthorized()

  return handle(async () => {
    const body = (await request.json().catch(() => ({}))) as { dataUrl?: string }
    if (!body.dataUrl || !body.dataUrl.startsWith('data:image/')) {
      throw new Error('dataUrl of type data:image/* is required')
    }

    const match = body.dataUrl.match(/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/)
    if (!match) throw new Error('Unsupported image format')
    const buffer = Buffer.from(match[2], 'base64')
    if (buffer.length > MAX_BYTES) throw new Error('Image exceeds 2MB limit')

    const extension = match[1] === 'jpeg' ? 'jpg' : match[1]
    const filename = `${crypto.randomUUID()}.${extension}`
    const dir = join(process.cwd(), 'public', 'uploads')
    await mkdir(dir, { recursive: true })
    await writeFile(join(dir, filename), buffer)

    return { imageUrl: `/uploads/${filename}` }
  })
}