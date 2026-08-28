'use client'

import { usePathname } from 'next/navigation'
import { ConsumerShell } from './consumer-shell'

const AUTH_PATHS = ['/consumer/login', '/consumer/signup', '/consumer/reset']

/**
 * Consumer layout router — renders the workspace shell everywhere except the
 * standalone auth pages, which need a clean full-viewport canvas.
 */
export function ConsumerRouteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  if (AUTH_PATHS.includes(pathname)) return <>{children}</>
  return <ConsumerShell>{children}</ConsumerShell>
}