'use client'

import { ReactNode } from 'react'
import { WorkspaceShell } from '@/components/workspace/workspace-shell'
import { WEMA_NAV, WEMA_TABS, WEMA_WORKSPACE_USER } from '@/components/workspace/workspace-nav'

/**
 * Wema shell — the farmer-dashboard design applied to the institutional role.
 */
export function WemaShell({ children }: { children: ReactNode }) {
  return (
    <WorkspaceShell variant="wema" user={WEMA_WORKSPACE_USER} nav={WEMA_NAV} tabs={WEMA_TABS}>
      {children}
    </WorkspaceShell>
  )
}