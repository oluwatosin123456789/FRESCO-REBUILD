'use client'

import { usePathname } from 'next/navigation'
import { WemaShell } from './wema-shell'

const AUTH_PATHS = ['/wema/login', '/wema/signup', '/wema/reset']

/**
 * Wema layout router — renders the full workspace shell everywhere except the
 * standalone auth pages, which need a clean full-viewport canvas.
 */
export function WemaRouteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  if (AUTH_PATHS.includes(pathname)) return <>{children}</>
  return <WemaShell>{children}</WemaShell>
}