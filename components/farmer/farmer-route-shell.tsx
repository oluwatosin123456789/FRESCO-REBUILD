'use client'

import { usePathname } from 'next/navigation'
import { FarmerShell } from './farmer-shell'

const AUTH_PATHS = ['/farmer/login', '/farmer/signup', '/farmer/reset']

/**
 * Farmer layout router — renders the full workspace shell everywhere except
 * the standalone auth pages, which need a clean full-viewport canvas.
 */
export function FarmerRouteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  if (AUTH_PATHS.includes(pathname)) return <>{children}</>
  return <FarmerShell>{children}</FarmerShell>
}