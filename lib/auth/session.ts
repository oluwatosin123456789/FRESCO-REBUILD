import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db'
import type { Role } from '@/lib/generated/prisma/enums'

export type SessionUser = {
  id: string
  email: string
  name: string
  role: Role
  farmerId?: string
  wemaAnalyst?: boolean
}

/**
 * Resolves the authenticated Supabase user to a Fresco User record,
 * upserting the local user row on first sign-in. Returns null when anonymous.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user?.email) return null

  let dbUser = await prisma.user.findUnique({ where: { email: user.email } })
  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        email: user.email,
        name: user.user_metadata?.name ?? user.email.split('@')[0] ?? 'User',
        role: (user.user_metadata?.role as Role) ?? 'FARMER',
      },
    })
  }

  const farmer = await prisma.farmerProfile.findUnique({
    where: { userId: dbUser.id },
    select: { id: true },
  })

  return {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    role: dbUser.role,
    farmerId: farmer?.id,
    wemaAnalyst: dbUser.role === 'WEMA_ANALYST' || dbUser.role === 'ADMIN',
  }
}

export async function requireRole(...roles: Role[]) {
  const session = await getSessionUser()
  if (!session) {
    return { session: null as SessionUser | null, error: 'Authentication required' as const, status: 401 }
  }
  if (roles.length > 0 && !roles.includes(session.role)) {
    return { session: null, error: 'You do not have permission to perform this action' as const, status: 403 }
  }
  return { session, error: null as null, status: 200 }
}

export async function getSession() {
  const user = await getSessionUser()
  if (user?.wemaAnalyst) return { wemaAnalyst: { id: user.id, name: user.name } }
  // Fallback demo analyst session
  return { wemaAnalyst: { id: 'analyst-01', name: 'K. Adebayo' } }
}