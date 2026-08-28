'use client'

import { useRef, useEffect } from 'react'
import { NOTIFICATIONS } from '@/lib/seed/dashboard.seed'

export function TopBar({
  searchValue,
  onSearch,
  onSearchSubmit,
  notifOpen,
  onToggleNotif,
  userName = 'K. Adebayo',
  userRole = 'Agri Credit, Wema Bank',
  userInitials = 'KA',
}: {
  searchValue: string
  onSearch: (value: string) => void
  onSearchSubmit?: () => void
  notifOpen: boolean
  onToggleNotif: () => void
  userName?: string
  userRole?: string
  userInitials?: string
}) {
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        if (notifOpen) onToggleNotif()
      }
    }
    if (notifOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [notifOpen, onToggleNotif])

  return (
    <header className="wema-topbar" role="banner">
      <div className="wema-search">
        <span className="wema-search-icon" aria-hidden="true">⌕</span>
        <input
          type="text"
          placeholder="Search consented farmers…"
          value={searchValue}
          onChange={(e) => onSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearchSubmit?.()}
          className="wema-search-input"
        />
      </div>
      <div className="wema-topbar-spacer" />
      <div className="wema-sync">LAST SYNC 09:24 · 18 AUG 2026</div>
      <div className="wema-divider" />
      <div className="wema-notif-wrapper" ref={notifRef}>
        <button
          className="wema-notif-btn"
          onClick={onToggleNotif}
          aria-label="Notifications"
          aria-expanded={notifOpen}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
          <span className="wema-notif-count">3</span>
        </button>
        {notifOpen && (
          <div className="wema-notif-panel" role="region" aria-label="Notifications">
            <div className="wema-notif-header">
              <span className="wema-notif-title">NOTIFICATIONS</span>
              <button className="wema-notif-close" onClick={onToggleNotif} aria-label="Close notifications">✕</button>
            </div>
            {NOTIFICATIONS.map((n, i) => (
              <div key={i} className="wema-notif-item">
                <span className="wema-notif-dot" style={n.dot as React.CSSProperties} />
                <div>
                  <div className="wema-notif-text">{n.text}</div>
                  <div className="wema-notif-time">{n.when}</div>
                </div>
              </div>
            ))}
            <button className="wema-notif-mark">Mark all as read</button>
          </div>
        )}
      </div>
      <div className="wema-user">
        <div className="wema-user-info">
          <div className="wema-user-name">{userName}</div>
          <div className="wema-user-role">{userRole}</div>
        </div>
        <div className="wema-user-avatar" aria-hidden="true">{userInitials}</div>
      </div>
    </header>
  )
}