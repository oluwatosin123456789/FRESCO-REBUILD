'use client'

import { ArrowUpRight, BarChart3, Bell, ChevronDown, CircleHelp, FileCheck2, Leaf, Menu, PackageCheck, ShieldCheck, ShoppingCart, Sparkles, WalletCards, X } from 'lucide-react'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export type RoleKey = 'farmer' | 'consumer' | 'wema'

const NAV: Record<RoleKey, Array<[string, string, React.ComponentType<{ size?: number }>]>> = {
  farmer: [
    ['overview', '/farmer', BarChart3],
    ['listings', '/farmer/produce', Leaf],
    ['orders', '/farmer/orders', PackageCheck],
    ['passport', '/farmer/passport', FileCheck2],
    ['insights', '/farmer/insights', Sparkles],
    ['consent', '/farmer/consent', ShieldCheck],
    ['finance', '/farmer/finance', WalletCards],
  ],
  consumer: [
    ['marketplace', '/marketplace', ShoppingCart],
    ['orders', '/consumer/orders', PackageCheck],
  ],
  wema: [
    ['overview', '/wema', BarChart3],
    ['opportunities', '/wema/opportunities', Sparkles],
    ['finance', '/wema/finance', WalletCards],
  ],
}

const ROLE_LABEL: Record<RoleKey, string> = {
  farmer: 'Farmer workspace',
  consumer: 'Marketplace',
  wema: 'Wema analyst',
}

export function AppShell({
  role,
  active,
  userName,
  children,
}: {
  role: RoleKey
  active: string
  userName: string
  children: React.ReactNode
}) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const initials = userName.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'HL'

  const signOut = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('fresco_session')
      localStorage.removeItem('fresco_role')
      document.cookie = 'fresco_session=; path=/; max-age=0'
    }
    try {
      await createClient().auth.signOut()
    } catch {}
    router.push('/auth/login')
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark"><Leaf size={18} /></div>
          <span>fres<span>co</span></span>
        </div>
        <nav className="role-switcher" aria-label="Workspace role">
          <span className="active">{ROLE_LABEL[role]}</span>
        </nav>
        <div className="top-actions">
          <button className="icon-button" aria-label="Notifications"><Bell size={18} /><i /></button>
          <div className="profile-button">
            <span className="avatar">{initials}</span>
            <span className="profile-copy"><b>{userName}</b><small>{ROLE_LABEL[role]}</small></span>
            <ChevronDown size={15} />
          </div>
          <button className="small-button" onClick={signOut}>Sign out</button>
          <button className="mobile-menu" aria-label="Open menu" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      <div className="workspace">
        <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
          <div className="side-label">Workspace</div>
          <div className="side-nav">
            {NAV[role].map(([key, href, Icon]) => (
              <a key={key} href={href} className={active === key ? 'active' : ''}>
                <Icon size={17} /> {key[0].toUpperCase() + key.slice(1)}
              </a>
            ))}
          </div>
          <div className="side-bottom">
            <div className="support-card">
              <div className="support-icon"><CircleHelp size={16} /></div>
              <div><b>Need a hand?</b><span>Visit support centre</span></div>
              <ArrowUpRight size={15} />
            </div>
            <div className="side-user">
              <span className="avatar small">{initials}</span>
              <div><b>{userName}</b><span>Fresco</span></div>
            </div>
          </div>
        </aside>
        <main className="main-content">{children}</main>
      </div>
    </div>
  )
}