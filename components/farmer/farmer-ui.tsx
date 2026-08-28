'use client'

import { CSSProperties, ReactNode } from 'react'
import Link from 'next/link'

export type FarmerPillTone = 'blue' | 'purple' | 'teal' | 'orange' | 'red' | 'green' | 'gold' | 'muted' | 'ink'

/** Mono uppercase eyebrow + serif headline + subtitle, matching the dashboard. */
export function FarmerHeader({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow: string
  title: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
}) {
  return (
    <header className="farmer-header">
      <div style={{ minWidth: 0 }}>
        <div className="farmer-eyebrow">
          <span className="farmer-eyebrow-dot" />
          {eyebrow}
        </div>
        <h1>{title}</h1>
        {subtitle ? <div className="farmer-subtitle">{subtitle}</div> : null}
      </div>
      {actions ? <div className="farmer-header-actions">{actions}</div> : null}
    </header>
  )
}

export function FarmerPill({ tone = 'muted', children, style }: { tone?: FarmerPillTone; children: ReactNode; style?: CSSProperties }) {
  return (
    <span className={`farmer-pill ${tone}`} style={style}>
      {children}
    </span>
  )
}

const STATUS_TONE: Record<string, FarmerPillTone> = {
  PAID: 'green',
  ACCEPTED: 'gold',
  PREPARING: 'orange',
  READY: 'gold',
  OUT_FOR_DELIVERY: 'teal',
  DELIVERED: 'green',
  COMPLETED: 'green',
  LISTED: 'green',
  DRAFT: 'muted',
  SCANNED: 'gold',
  REJECTED: 'red',
  APPROVED: 'green',
  DECLINED: 'red',
  GRANTED: 'green',
  REVOKED: 'red',
}

export function FarmerStatusPill({ status, label }: { status: string; label?: string }) {
  const tone = STATUS_TONE[status] ?? 'muted'
  return <FarmerPill tone={tone}>{label ?? status.replace(/_/g, ' ')}</FarmerPill>
}

export type FarmerButtonTone = 'blue' | 'dark' | 'outline' | 'ghost' | 'gold' | 'danger'

export function FarmerButton({
  tone = 'blue',
  small = false,
  block = false,
  href,
  onClick,
  children,
  style,
  disabled = false,
}: {
  tone?: FarmerButtonTone
  small?: boolean
  block?: boolean
  href?: string
  onClick?: () => void
  children: ReactNode
  style?: CSSProperties
  disabled?: boolean
}) {
  const cls = `farmer-button ${tone}${small ? ' sm' : ''}${block ? ' block' : ''}`
  const merged: CSSProperties = { ...style }
  if (href) {
    return (
      <Link href={href} className={cls} style={merged}>
        {children}
      </Link>
    )
  }
  return (
    <button type="button" onClick={onClick} className={cls} style={merged} disabled={disabled}>
      {children}
    </button>
  )
}

export function FarmerMetric({ label, value, sub, style }: { label: string; value: ReactNode; sub?: ReactNode; style?: CSSProperties }) {
  return (
    <div className="farmer-metric" style={style}>
      <span className="farmer-metric-label">{label}</span>
      <strong className="farmer-metric-value">{value}</strong>
      {sub ? <span style={{ display: 'block', color: '#a6abb1', fontSize: 9, marginTop: 6 }}>{sub}</span> : null}
    </div>
  )
}

export function FarmerSection({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
}) {
  return (
    <section>
      <div className="farmer-section-heading">
        <div className="farmer-section-heading-left">
          <span className="farmer-section-heading-title">{title}</span>
          {subtitle ? <span className="farmer-section-heading-subtitle">{subtitle}</span> : null}
        </div>
        {actions ?? <span className="farmer-section-dots">•••</span>}
      </div>
      {children}
    </section>
  )
}

export function FarmerNote({ children }: { children: ReactNode }) {
  return (
    <div className="farmer-note">
      <span style={{ color: '#3fa88e', fontWeight: 800, flexShrink: 0 }}>◆</span>
      <div>{children}</div>
    </div>
  )
}

export function FarmerTip({ children }: { children: ReactNode }) {
  return (
    <div className="farmer-tip">
      <span style={{ color: '#b9820a', fontWeight: 800, flexShrink: 0 }}>◆</span>
      <div>{children}</div>
    </div>
  )
}