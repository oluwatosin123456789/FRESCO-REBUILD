'use client'

import { ReactNode } from 'react'
import { WorkspaceShell, type WorkspaceTab } from '@/components/workspace/workspace-shell'
import { CONSUMER_NAV, CONSUMER_TABS, CONSUMER_WORKSPACE_USER } from '@/components/workspace/workspace-nav'
import { countFor, useCartState } from './consumer-store'

/**
 * Consumer shell — the farmer-dashboard design applied to the consumer role.
 * The cart badge stays live via the shared store.
 */
export function ConsumerShell({ children }: { children: ReactNode }) {
  const cart = useCartState()
  const count = countFor(cart)

  const withCartBadge = (items: WorkspaceTab[]): WorkspaceTab[] =>
    items.map((item) =>
      item.key === 'cart' ? { ...item, badge: count > 0 ? count : undefined } : item
    )

  return (
    <WorkspaceShell
      variant="consumer"
      user={CONSUMER_WORKSPACE_USER}
      nav={CONSUMER_NAV}
      tabs={withCartBadge(CONSUMER_TABS)}
    >
      {children}
    </WorkspaceShell>
  )
}