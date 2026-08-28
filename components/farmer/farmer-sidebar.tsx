'use client'

import Link from 'next/link'
import { FARMER } from '@/lib/seed/fresco-baseline'

export type FarmerNavItem = {
  key: string
  label: string
  href: string
  compact?: boolean
}

export const FARMER_NAV_ITEMS: FarmerNavItem[] = [
  { key: 'dashboard', label: 'Dashboard', href: '/farmer' },
  { key: 'produce', label: 'Produce', href: '/farmer/produce' },
  { key: 'orders', label: 'Orders', href: '/farmer/orders' },
  { key: 'scan', label: 'Scan', href: '/farmer/scan' },
  { key: 'history', label: 'History', href: '/farmer/history' },
  { key: 'passport', label: 'Financial Passport', href: '/farmer/passport', compact: true },
  { key: 'feap', label: 'FEAP', href: '/farmer/feap' },
  { key: 'coach', label: 'AI Insights', href: '/farmer/coach' },
  { key: 'consent', label: 'Consent', href: '/farmer/consent' },
  { key: 'finance', label: 'Finance', href: '/farmer/finance' },
]

export type FarmerBottomTab = {
  key: string
  label: string
  icon: string
  href: string
  cta?: boolean
}

export const FARMER_BOTTOM_TABS: FarmerBottomTab[] = [
  { key: 'dashboard', label: 'Dashboard', icon: '🏠', href: '/farmer' },
  { key: 'produce', label: 'Produce', icon: '🥬', href: '/farmer/produce' },
  { key: 'scan', label: 'Scan', icon: '📷', href: '/farmer/scan', cta: true },
  { key: 'orders', label: 'Orders', icon: '📦', href: '/farmer/orders' },
  { key: 'passport', label: 'Passport', icon: '📋', href: '/farmer/passport' },
]

export function farmerActiveKey(pathname: string | null): string {
  if (!pathname || pathname === '/farmer' || pathname === '/farmer/') return 'dashboard'
  // Match the longest specific route — the dashboard's bare "/farmer" href would
  // prefix-match every subroute, so it is excluded here and handled above.
  const match = FARMER_NAV_ITEMS.find(
    (item) => item.href !== '/farmer' && pathname.startsWith(item.href),
  )
  return match?.key ?? 'dashboard'
}

/**
 * Shared farmer sidebar — transparent panel floating on the black frame,
 * matching the farmer-dashboard design language. Rendered once from the
 * farmer layout so individual pages never mount their own navigation.
 */
export function FarmerSidebar({ active }: { active: string }) {
  return (
    <aside className="farmer-sidebar">
      <div className="farmer-profile">
        <div className="farmer-avatar-wrap">
          <div className="farmer-avatar">{FARMER.initials}</div>
          <span className="farmer-notification">4</span>
        </div>
        <div className="farmer-profile-name">{FARMER.name}</div>
        <div className="farmer-profile-email">
          {FARMER.farm} · {FARMER.location}
        </div>
      </div>

      <nav className="farmer-navigation" aria-label="Farmer navigation">
        {FARMER_NAV_ITEMS.map((item) => {
          const isActive = item.key === active
          return (
            <Link
              key={item.key}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={`farmer-nav-item${item.compact ? ' passport' : ''}${isActive ? ' active' : ''}`}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

/** Mobile app-style tab bar, hidden on desktop. */
export function FarmerBottomNav({ active }: { active: string }) {
  return (
    <nav className="farmer-bottom-nav" aria-label="Primary">
      {FARMER_BOTTOM_TABS.map((tab) => {
        const isActive = tab.key === active
        return (
          <Link
            key={tab.key}
            href={tab.href}
            aria-current={isActive ? 'page' : undefined}
            className={`farmer-bottom-tab${tab.cta ? ' cta' : ''}${isActive ? ' on' : ''}`}
          >
            <span className="farmer-bottom-pip">{tab.icon}</span>
            <span>{tab.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}