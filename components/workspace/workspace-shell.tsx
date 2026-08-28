'use client'

import { ReactNode, createContext, useContext, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Leaf, LogOut } from 'lucide-react'
import { SignOutDialog } from './signout-dialog'
import { readClientSession } from '@/lib/auth/client-session'

export type WorkspaceUser = {
  name: string
  sub: string
  initials: string
  notification?: number
  avatarGradient?: string
  avatarUrl?: string
}

export type WorkspaceNavItem = {
  key: string
  label: string
  href: string
  compact?: boolean
  badge?: number | string
}

export type WorkspaceTab = {
  key: string
  label: string
  icon: string
  href: string
  cta?: boolean
  badge?: number | string
}

export type WorkspaceVariant = 'farmer' | 'consumer' | 'wema'

type RightPanelCtx = { setRight: (node: ReactNode) => void }

const RightPanelContext = createContext<RightPanelCtx>({ setRight: () => {} })

/**
 * Registers a page's right-hand side panel into the shared shell. The shell
 * is mounted once from each role layout, so pages that need a side rail
 * contribute it through this hook instead of mounting their own shell.
 */
export function useWorkspaceRightPanel(node: ReactNode) {
  const { setRight } = useContext(RightPanelContext)
  useEffect(() => {
    setRight(node)
    return () => setRight(null)
  }, [node, setRight])
}

/**
 * Resolves the active nav key from the pathname. Exact matches win; otherwise
 * the longest route prefix matches (the bare role root — a single segment —
 * is excluded from prefix matching so it never swallows sub-routes).
 */
export function workspaceActiveKey(
  pathname: string | null,
  nav: WorkspaceNavItem[],
  fallback = 'overview',
): string {
  if (!pathname) return fallback
  for (const item of nav) {
    if (pathname === item.href) return item.key
  }
  let best: WorkspaceNavItem | undefined
  for (const item of nav) {
    if (/^\/[^/]+$/.test(item.href)) continue
    if (pathname.startsWith(item.href + '/') && (!best || item.href.length > best.href.length)) {
      best = item
    }
  }
  return best?.key ?? fallback
}

/**
 * Shared role workspace shell — reproduces the farmer-dashboard design across
 * every role: a near-black frame spans the viewport, a transparent sidebar
 * floats on the left (hidden on mobile in favour of a bottom tab bar), and
 * page content lives in a white, rounded "application" panel. All styles come
 * from app/farmer-workspace.css (loaded once at the root layout).
 */
export function WorkspaceShell({
  variant,
  user,
  nav,
  tabs,
  active,
  right,
  children,
}: {
  variant: WorkspaceVariant
  user: WorkspaceUser
  nav: WorkspaceNavItem[]
  tabs: WorkspaceTab[]
  active?: string
  right?: ReactNode
  children: ReactNode
}) {
  const pathname = usePathname()
  const resolvedActive = active ?? workspaceActiveKey(pathname, nav, nav[0]?.key ?? 'overview')
  const [contextRight, setRight] = useState<ReactNode>(null)
  const [signOutOpen, setSignOutOpen] = useState(false)
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null)
  const rightPanel = right ?? contextRight

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setAvatarSrc(readClientSession()?.avatar ?? null)
    })
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <RightPanelContext.Provider value={{ setRight }}>
      <div className={`farmer-dashboard variant-${variant}`}>
        <div className="farmer-frame">
          <aside className="farmer-sidebar">
            <div className="farmer-brand">
              <span className="farmer-brand-mark"><Leaf size={17} strokeWidth={2.2} /></span>
              <span>
                <span className="farmer-brand-name">Fresco</span>
                <span className="farmer-brand-tag">Verified commerce</span>
              </span>
            </div>
            <div className="farmer-profile">
              <div className="farmer-avatar-wrap">
                {(avatarSrc || user.avatarUrl) ? (
                  <img
                    src={avatarSrc ?? user.avatarUrl}
                    alt={user.name}
                    className="farmer-avatar farmer-avatar--photo"
                  />
                ) : (
                  <div
                    className="farmer-avatar"
                    style={user.avatarGradient ? { background: user.avatarGradient } : undefined}
                  >
                    {user.initials}
                  </div>
                )}
                {user.notification ? <span className="farmer-notification">{user.notification}</span> : null}
              </div>
              <div className="farmer-profile-name">{user.name}</div>
              <div className="farmer-profile-email">{user.sub}</div>
            </div>

            <nav className="farmer-navigation" aria-label={`${variant} navigation`}>
              {nav.map((item) => {
                const isActive = item.key === resolvedActive
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={`farmer-nav-item${item.compact ? ' passport' : ''}${isActive ? ' active' : ''}`}
                  >
                    {item.label}
                    {item.badge != null ? <span className="farmer-nav-badge">{item.badge}</span> : null}
                  </Link>
                )
              })}
            </nav>

            <button className="farmer-signout" type="button" onClick={() => setSignOutOpen(true)}>
              <LogOut size={15} strokeWidth={2.2} />
              <span>Sign out</span>
            </button>
          </aside>

          <main className="farmer-application">
            <section className="farmer-content">{children}</section>
            {rightPanel ? <aside className="farmer-right-panel">{rightPanel}</aside> : null}
          </main>
        </div>

        <nav className="farmer-bottom-nav" aria-label="Primary">
          {tabs.map((tab) => {
            const isActive = tab.key === resolvedActive
            return (
              <Link
                key={tab.key}
                href={tab.href}
                aria-current={isActive ? 'page' : undefined}
                className={`farmer-bottom-tab${tab.cta ? ' cta' : ''}${isActive ? ' on' : ''}`}
              >
                <span className="farmer-bottom-pip">
                  {tab.icon}
                  {tab.badge != null ? <span className="farmer-bottom-badge">{tab.badge}</span> : null}
                </span>
                <span>{tab.label}</span>
              </Link>
            )
          })}
          <button type="button" className="farmer-bottom-tab signout" onClick={() => setSignOutOpen(true)} aria-label="Sign out">
            <span className="farmer-bottom-pip"><LogOut size={18} strokeWidth={2.2} /></span>
            <span>Sign out</span>
          </button>
        </nav>

        <SignOutDialog open={signOutOpen} onClose={() => setSignOutOpen(false)} role={variant} user={user} />
      </div>
    </RightPanelContext.Provider>
  )
}