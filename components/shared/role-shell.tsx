'use client'

import Link from 'next/link'
import { ReactNode } from 'react'

export type ShellNavItem = {
  key: string
  label: string
  href: string
  icon?: string
  badge?: number | string
  cta?: boolean
}

export type ShellUser = {
  name: string
  sub: string
  initials: string
  avatarGradient?: string
}

type ShellVariant = 'farmer' | 'wema' | 'consumer'

const THEMES: Record<
  ShellVariant,
  {
    sidebarBackground: string
    brandMark: string
    brandMarkGradient: string
    brandName: string
    brandAccent: string
    rolePill: string
    sectionLabel: string
  }
> = {
  farmer: {
    sidebarBackground: '#111111',
    brandMark: '🌿',
    brandMarkGradient: 'linear-gradient(135deg, #315642 0%, #4a6b52 100%)',
    brandName: 'fres',
    brandAccent: 'co',
    rolePill: '🌾 Farmer Workspace',
    sectionLabel: 'Navigation',
  },
  consumer: {
    sidebarBackground: 'linear-gradient(180deg, #1a2e22 0%, #0d1a12 100%)',
    brandMark: '🌿',
    brandMarkGradient: 'linear-gradient(135deg, #4a6b52 0%, #6c9360 100%)',
    brandName: 'fres',
    brandAccent: 'co',
    rolePill: '🛒 Consumer Marketplace',
    sectionLabel: 'Navigation',
  },
  wema: {
    sidebarBackground: 'linear-gradient(180deg, #171713 0%, #0d0d0b 100%)',
    brandMark: '🏦',
    brandMarkGradient: 'linear-gradient(135deg, #2a2a26 0%, #1a1a18 100%)',
    brandName: 'Wema',
    brandAccent: '',
    rolePill: 'Institutional',
    sectionLabel: 'Agricultural Portfolio',
  },
}

/**
 * Full-width shell: sidebar navigation on desktop, collapsing to a bottom
 * tab bar on mobile — consistent across every role.
 */
export function RoleShell({
  user,
  nav,
  active,
  children,
  right,
  contentStyle,
  variant = 'farmer',
  tabs,
}: {
  user: ShellUser
  nav: ShellNavItem[]
  active: string
  children: ReactNode
  right?: ReactNode
  contentStyle?: React.CSSProperties
  variant?: ShellVariant
  tabs?: ShellNavItem[]
}) {
  const theme = THEMES[variant]
  const isFarmer = variant === 'farmer'

  return (
    <div className={`shell-root ${isFarmer ? 'farmer-scope' : ''}`}>
      <aside className={`shell-sidebar ${isFarmer ? 'shell-sidebar--idx' : ''}`} style={{ background: theme.sidebarBackground }}>
        {isFarmer ? (
          <>
            <div className="idx-profile">
              <div
                className="idx-avatar"
                style={{ background: user.avatarGradient ?? 'linear-gradient(145deg,#607c4b 0%,#2a4930 100%)' }}
              >
                {user.initials}
                <span className="idx-notification">4</span>
              </div>
              <div className="idx-name">{user.name}</div>
              <div className="idx-sub">{user.sub}</div>
            </div>

            <nav className="idx-nav">
              {nav.map((item) => {
                const isActive = item.key === active
                return (
                  <Link key={item.key} href={item.href} className={`idx-nav-item ${isActive ? 'on' : ''}`}>
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </>
        ) : (
          <>
            <div className="shell-header">
              <div className="shell-brand">
                <div className="shell-brand-mark" style={{ background: theme.brandMarkGradient, color: '#c8a84b' }}>
                  {theme.brandMark}
                </div>
                <span className="shell-wordmark">
                  {theme.brandName}
                  {theme.brandAccent ? <span>{theme.brandAccent}</span> : null}
                </span>
              </div>
              <span className="shell-role-pill">{theme.rolePill}</span>
            </div>

            <div className="shell-section-label">{theme.sectionLabel}</div>
            <nav className="shell-nav">
              {nav.map((item) => {
                const isActive = item.key === active
                return (
                  <Link key={item.key} href={item.href} className={`shell-nav-item ${isActive ? 'active' : ''}`}>
                    {isActive ? <span className="shell-nav-active-bar" /> : null}
                    {item.icon ? <span className="shell-nav-icon">{item.icon}</span> : null}
                    <span>{item.label}</span>
                    {item.badge != null ? <span className="shell-nav-badge">{item.badge}</span> : null}
                  </Link>
                )
              })}
            </nav>

            <div className="shell-bottom">
              <div className="shell-user">
                <div className="shell-avatar" style={{ background: user.avatarGradient ?? 'linear-gradient(135deg,#315642 0%,#4a6b52 100%)' }}>
                  {user.initials}
                </div>
                <div className="shell-user-info">
                  <strong>{user.name}</strong>
                  <small>{user.sub}</small>
                </div>
              </div>
            </div>
          </>
        )}
      </aside>

      <main style={{ flex: 1, minWidth: 0, minHeight: 0, background: '#fafafa', display: 'flex' }}>
        <section className="shell-content" style={{ flex: 1, minWidth: 0, overflowY: 'auto', padding: '40px 55px 35px 61px', ...contentStyle }}>
          {children}
        </section>
        {right ? (
          <aside
            style={{
              width: 245,
              flexShrink: 0,
              background: 'var(--panel)',
              borderLeft: '1px solid var(--line)',
              padding: '47px 39px 30px',
              overflowY: 'auto',
            }}
          >
            {right}
          </aside>
        ) : null}
      </main>

      <nav className="shell-bottom-nav" aria-label="Primary">
        {(tabs ?? nav).map((item) => {
          const isActive = item.key === active
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`shell-bottom-tab ${item.cta ? 'cta' : ''} ${isActive ? 'on' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="shell-bottom-pip">{item.icon ?? ''}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
