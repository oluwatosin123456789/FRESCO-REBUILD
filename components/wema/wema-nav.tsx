'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAV_ITEMS } from '@/lib/seed/dashboard.seed'

export function WemaNav() {
  const pathname = usePathname()
  const current = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <nav className="wema-nav" aria-label="Wema portal navigation">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={current(item.href) ? 'page' : undefined}
          className={`wema-nav-item${current(item.href) ? ' active' : ''}`}
        >
          <span>{item.label}</span>
          {item.badge && (
            <span className="wema-nav-badge">{item.badge}</span>
          )}
        </Link>
      ))}
      <hr />
      <div className="wema-nav-foot">
        <span className="wema-chip">DEMO / SIMULATED</span>
        <p>FRESCO × WEMA</p>
      </div>
    </nav>
  )
}