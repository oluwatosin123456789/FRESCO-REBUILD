'use client'

import { CSSProperties, ReactNode } from 'react'

// Inline-style building blocks that reproduce the Fresco mockup design tokens
// (app/mockup.css) inside the index.html dark-frame shell. Colors resolve via
// the CSS variables imported globally in globals.css.

export const SANS = 'var(--sans)'
export const SERIF = 'var(--serif)'
export const MONO = 'var(--mono)'

/* ── pills ──────────────────────────────────────────────────────────── */

export type PillTone = 'green' | 'gold' | 'clay' | 'warn' | 'red' | 'muted' | 'ink'

const PILL_TONES: Record<PillTone, { bg: string; color: string; border: string }> = {
  green: { bg: 'var(--green-bg)', color: 'var(--green)', border: '#c9e6cf' },
  gold: { bg: 'var(--gold-bg)', color: '#b9820a', border: '#f0ddb3' },
  clay: { bg: 'var(--clay-bg)', color: 'var(--clay)', border: '#f5c4c7' },
  warn: { bg: 'var(--warn-bg)', color: '#b9820a', border: '#f0ddb3' },
  red: { bg: 'var(--red-bg)', color: 'var(--red)', border: '#f5c4c7' },
  muted: { bg: '#f0f1f3', color: '#989da4', border: '#e2e5e9' },
  ink: { bg: '#eef0f2', color: 'var(--ink)', border: '#dde1e6' },
}

export function Pill({ tone = 'muted', children, style }: { tone?: PillTone; children: ReactNode; style?: CSSProperties }) {
  const t = PILL_TONES[tone]
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '3px 9px',
        borderRadius: 999,
        font: '600 10.5px ' + MONO,
        letterSpacing: '.06em',
        textTransform: 'uppercase',
        border: '1px solid transparent',
        whiteSpace: 'nowrap',
        background: t.bg,
        color: t.color,
        borderColor: t.border,
        ...style,
      }}
    >
      {children}
    </span>
  )
}

export function statusPill(status: string) {
  const map: Record<string, [string, PillTone]> = {
    PAID: ['Paid', 'green'],
    ACCEPTED: ['Accepted', 'gold'],
    PREPARING: ['Preparing', 'warn'],
    READY: ['Ready', 'gold'],
    OUT_FOR_DELIVERY: ['Out for delivery', 'green'],
    DELIVERED: ['Delivered', 'green'],
    COMPLETED: ['Completed', 'green'],
    LISTED: ['Listed', 'green'],
    DRAFT: ['Draft', 'muted'],
    SCANNED: ['Scanned', 'gold'],
    REJECTED: ['Rejected', 'red'],
  }
  const [label, tone] = map[status] || [status, 'muted']
  return <Pill tone={tone}>{label}</Pill>
}

/* ── layout primitives ──────────────────────────────────────────────── */

export function Card({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        background: 'var(--panel)',
        border: '1px solid var(--line)',
        borderRadius: 14,
        padding: 20,
        boxShadow: '0 5px 16px rgba(25,42,61,.03)',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

export function CardGrid({ children, columns = 4, gap = 14, style }: { children: ReactNode; columns?: number; gap?: number; style?: CSSProperties }) {
  return (
    <div style={{ display: 'grid', gap, gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${Math.max(180, Math.floor(1200 / columns))}px), 1fr))`, ...style }}>
      {children}
    </div>
  )
}

export function PageHeader({ eyebrow, title, lede, action }: { eyebrow?: string; title: string; lede?: ReactNode; action?: ReactNode }) {
  return (
    <header style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 26 }}>
      <div style={{ minWidth: 0 }}>
        {eyebrow ? <div style={{ font: '600 10.5px ' + MONO, letterSpacing: '.13em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>{eyebrow}</div> : null}
        <h1 style={{ font: '700 clamp(26px,3vw,32px)/1.1 ' + SERIF, letterSpacing: '-.01em', color: 'var(--ink)' }}>{title}</h1>
        {lede ? <div style={{ color: 'var(--ink2)', fontSize: 13.5, marginTop: 4, maxWidth: 560 }}>{lede}</div> : null}
      </div>
      {action ? <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>{action}</div> : null}
    </header>
  )
}

function TrendArrow({ dir }: { dir: 'up' | 'down' }) {
  const color = dir === 'up' ? '#2e9b6f' : '#e05b4d'
  return (
    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      {dir === 'up' ? (
        <path d="M3 9 9 3M9 3H4.5M9 3v4.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M3 3 9 9M9 9H4.5M9 9V4.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  )
}

export function Metric({
  label,
  value,
  sub,
  style,
  icon,
  trend,
}: {
  label: string
  value: ReactNode
  sub?: ReactNode
  style?: CSSProperties
  icon?: ReactNode
  trend?: 'up' | 'down'
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 14, padding: 18, position: 'relative', overflow: 'hidden', ...style }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ font: '600 10.5px ' + MONO, letterSpacing: '.09em', textTransform: 'uppercase', color: 'var(--muted)', lineHeight: 1.5 }}>{label}</div>
        {icon ? (
          <span style={{ width: 30, height: 30, borderRadius: 9, display: 'grid', placeItems: 'center', color: 'var(--forest)', background: 'color-mix(in srgb, var(--forest) 12%, transparent)', flexShrink: 0 }}>{icon}</span>
        ) : null}
      </div>
      <div style={{ font: '600 30px/1.1 ' + SERIF, letterSpacing: '-.01em', color: 'var(--ink)' }}>{value}</div>
      {sub ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
          {trend ? <TrendArrow dir={trend} /> : null}
          <span>{sub}</span>
        </div>
      ) : null}
    </div>
  )
}

export function Stat({ label, value, style }: { label: string; value: ReactNode; style?: CSSProperties }) {
  return (
    <div style={style}>
      <div style={{ fontSize: 8.5, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: MONO, marginBottom: 5 }}>{label}</div>
      <div style={{ color: 'var(--ink2)', fontSize: 15, fontWeight: 700, letterSpacing: '-.02em' }}>{value}</div>
    </div>
  )
}

export function Bar({ height, active = false, color }: { height: number; active?: boolean; color?: string }) {
  return (
    <div
      style={{
        width: 10,
        flexShrink: 0,
        borderRadius: '1px 1px 0 0',
        height: `${height}%`,
        background: active ? color ?? 'var(--forest)' : 'var(--line2)',
      }}
    />
  )
}

export function ProgressBar({ width, color = 'var(--forest)', height = 3 }: { width: number; color?: string; height?: number }) {
  return (
    <div style={{ height, width: '100%', background: 'var(--line)', borderRadius: height, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${Math.min(Math.max(width, 0), 100)}%`, background: color, borderRadius: 'inherit' }} />
    </div>
  )
}

export function Ring({ score, size = 150, color = 'var(--forest)' }: { score: number; size?: number; color?: string }) {
  const r = size / 2 - 8
  const c = 2 * Math.PI * r
  const off = c * (1 - score / 100)
  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'grid', placeItems: 'center' }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} style={{ transform: 'rotate(-90deg)', position: 'absolute', inset: 0 }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth={6} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={6} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off} />
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <div style={{ font: '600 28px/1 ' + SERIF, color: 'var(--ink)' }}>{score}</div>
        <div style={{ font: '600 10px ' + MONO, color: 'var(--muted)' }}>/ 100</div>
      </div>
    </div>
  )
}

export function Divider({ style }: { style?: CSSProperties }) {
  return <div style={{ height: 1, background: 'var(--line)', margin: '16px 0', ...style }} />
}

export function TipBar({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: 'var(--gold-bg)', border: '1px solid #f0ddb3', borderRadius: 12, padding: '12px 15px', fontSize: 12.5, color: '#8a6d1f', lineHeight: 1.5 }}>
      {children}
    </div>
  )
}

export function NoteBar({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: 'var(--green-bg)', border: '1px solid #c9e6cf', borderRadius: 12, padding: '12px 15px', fontSize: 12.5, color: 'var(--green)', lineHeight: 1.5 }}>
      {children}
    </div>
  )
}

export function EmptyCard({ children }: { children: ReactNode }) {
  return (
    <div style={{ textAlign: 'center', maxWidth: 460, margin: '30px auto', padding: '44px 30px', background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 14 }}>
      {children}
    </div>
  )
}

/* ── buttons ────────────────────────────────────────────────────────── */

export type ButtonTone = 'dark' | 'green' | 'gold' | 'outline' | 'ghost' | 'danger' | 'sage'

const BTN_TONES: Record<ButtonTone, CSSProperties> = {
  dark: { background: 'var(--dark)', color: '#ffffff' },
  green: { background: 'var(--forest)', color: '#ffffff', boxShadow: '0 6px 16px rgba(24,136,246,.22)' },
  gold: { background: 'var(--gold)', color: '#ffffff' },
  outline: { background: 'var(--panel2)', border: '1px solid var(--line)', color: 'var(--ink)' },
  ghost: { background: 'transparent', color: 'var(--ink)', border: '1px solid transparent' },
  danger: { background: 'var(--red)', color: '#ffffff' },
  sage: { background: '#eef2f6', color: 'var(--ink2)' },
}

export function Btn({ tone = 'dark', children, onClick, href, small = false, block = false, style }: {
  tone?: ButtonTone
  children: ReactNode
  onClick?: () => void
  href?: string
  small?: boolean
  block?: boolean
  style?: CSSProperties
}) {
  const base: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    border: 0,
    borderRadius: small ? 8 : 10,
    padding: small ? '7px 12px' : '11px 18px',
    font: '600 ' + (small ? 12.5 : 13.5) + 'px ' + SANS,
    letterSpacing: '.01em',
    whiteSpace: 'nowrap',
    textDecoration: 'none',
    cursor: 'pointer',
    ...BTN_TONES[tone],
    ...(block ? { width: '100%' } : {}),
    ...style,
  }
  if (href) {
    return <a href={href} style={base}>{children}</a>
  }
  return (
    <button type="button" onClick={onClick} style={base}>
      {children}
    </button>
  )
}
