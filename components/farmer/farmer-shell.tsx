'use client'

import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { WorkspaceShell, useWorkspaceRightPanel } from '@/components/workspace/workspace-shell'
import { FARMER_NAV_ITEMS, FARMER_BOTTOM_TABS, farmerActiveKey } from './farmer-sidebar'
import { FARMER_WORKSPACE_USER } from '@/components/workspace/workspace-nav'

export { useWorkspaceRightPanel as useFarmerRightPanel }

/**
 * Shared farmer workspace shell — delegates to the generic role shell so the
 * farmer, consumer and wema roles share one design system. Mounted once from
 * the farmer layout; pages only describe content.
 */
export function FarmerShell({
  children,
  right,
}: {
  children: ReactNode
  right?: ReactNode
}) {
  const pathname = usePathname()

  return (
    <WorkspaceShell
      variant="farmer"
      user={FARMER_WORKSPACE_USER}
      nav={FARMER_NAV_ITEMS}
      tabs={FARMER_BOTTOM_TABS}
      active={farmerActiveKey(pathname)}
      right={right}
    >
      {children}
    </WorkspaceShell>
  )
}