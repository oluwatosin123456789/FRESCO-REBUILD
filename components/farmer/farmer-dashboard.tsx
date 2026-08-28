'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Bell, CheckCircle2, ChevronRight, ScanLine, ShieldCheck, ShoppingCart, Star, Truck } from 'lucide-react'
import { useFarmerRightPanel } from '@/components/farmer/farmer-shell'
import { api, naira } from '@/lib/client-api'

 type Passport = {
  lifetimeRevenue: number
  recentRevenue: number
  transactionCount: number
  completedOrders: number
  fulfillmentRate: number
  customerCount: number
  repeatCustomerCount: number
  averageRating: number
  qualityConsistency: number
  activeMonths: number
  feap: number
  profileMaturity: number
}

type TimelineEntry = {
  type: string
  label: string
  occurredAt: string
}

type ActivityItem = { type: string; title: string; meta: string; status: string }

function bandOf(feap: number): [string, string] {
  if (feap < 40) return ['Emerging', '#8C8C7A']
  if (feap < 55) return ['Building', '#f6b73c']
  if (feap < 70) return ['Developing', '#43bea2']
  if (feap < 85) return ['Established', '#ae4938']
  return ['Strong', '#111111']
}

const FEAP_CATEGORIES = [
  { name: 'Transaction consistency', weight: 30, color: '#ae4938' },
  { name: 'Revenue consistency', weight: 20, color: '#43b99e' },
  { name: 'Fulfillment reliability', weight: 15, color: '#49ba51' },
  { name: 'Customer reputation', weight: 15, color: '#ff8a0a' },
  { name: 'Quality consistency', weight: 10, color: '#b63fd0' },
  { name: 'Business longevity', weight: 10, color: '#c69333' },
]

const MONTHLY_REVENUE = [
  { m: 'SEP', v: 132 },
  { m: 'OCT', v: 148 },
  { m: 'NOV', v: 141 },
  { m: 'DEC', v: 167 },
  { m: 'JAN', v: 182 },
  { m: 'FEB', v: 176 },
  { m: 'MAR', v: 199 },
  { m: 'APR', v: 214 },
  { m: 'MAY', v: 208 },
  { m: 'JUN', v: 232 },
  { m: 'JUL', v: 246 },
  { m: 'AUG', v: 262 },
]

const TYPE_COLOR: Record<string, string> = {
  order: '#ae4938',
  scan: '#b63fd0',
  consent: '#ff8a0a',
}

const TYPE_ICON: Record<string, React.ReactNode> = {
  order: <ShoppingCart size={15} strokeWidth={2.4} />,
  scan: <ScanLine size={15} strokeWidth={2.4} />,
  consent: <ShieldCheck size={15} strokeWidth={2.4} />,
}

const TYPE_LABEL: Record<string, string> = {
  order: 'Verified order',
  scan: 'Fresco quality scan',
  consent: 'Consent updated',
}

const FALLBACK_ACTIVITY: { day: string; items: ActivityItem[] }[] = [
  {
    day: 'Today',
    items: [
      { type: 'order', title: 'Tomato order completed', meta: 'Verified order', status: 'Verified' },
      { type: 'scan', title: 'Produce quality verified', meta: 'Fresco scan', status: 'Fresco' },
    ],
  },
  {
    day: 'Yesterday',
    items: [
      { type: 'order', title: 'Customer order fulfilled', meta: 'Verified order', status: 'Verified' },
      { type: 'consent', title: 'Financial data consent updated', meta: 'Consent updated', status: 'Updated' },
    ],
  },
  {
    day: '2 days ago',
    items: [
      { type: 'order', title: 'Produce sale verified', meta: 'Verified order', status: 'Verified' },
    ],
  },
]

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-NG').format(value)
}

function compactNaira(value: number) {
  if (value >= 1_000_000) return `₦${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M+`
  if (value >= 1_000) return `₦${Math.round(value / 1_000)}K+`
  return naira(value)
}

function formatDate(date: string) {
  if (!date) return 'Recent'
  return new Date(date).toLocaleDateString('en-NG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function smoothPath(pts: readonly (readonly [number, number])[]): string {
  if (pts.length < 2) return ''
  let d = `M ${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] ?? p2
    const c1x = p1[0] + (p2[0] - p0[0]) / 6
    const c1y = p1[1] + (p2[1] - p0[1]) / 6
    const c2x = p2[0] - (p3[0] - p1[0]) / 6
    const c2y = p2[1] - (p3[1] - p1[1]) / 6
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`
  }
  return d
}

function RevenueChart({ data }: { data: { m: string; v: number }[] }) {
  const [active, setActive] = useState<number | null>(null)
  const values = data.map((d) => d.v)
  const max = Math.max(...values)
  const min = Math.min(...values)
  const range = max - min || 1
  const pad = range * 0.22
  const lo = min - pad
  const hi = max + pad
  const X = (i: number) => (i / (data.length - 1)) * 100
  const Y = (v: number) => ((hi - v) / (hi - lo)) * 100
  const pts = data.map((d, i) => [X(i), Y(d.v)] as const)
  const line = smoothPath(pts)
  const area = `${line} L 100 100 L 0 100 Z`
  const total = values.reduce((s, v) => s + v, 0)

  return (
    <>
      <div className="farmer-chart-head">
        <div>
          <div className="farmer-chart-title">Revenue · last 12 months</div>
          <div className="farmer-chart-sub">Monthly verified turnover in ₦ thousands</div>
        </div>
        <div className="farmer-chart-total">₦{(total / 1000).toFixed(2)}M total</div>
      </div>

      <div className="farmer-chart">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="farmer-chart-gridline" style={{ top: `${(i / 3) * 100}%` }} />
        ))}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="farmer-chart-svg" aria-hidden="true">
          <defs>
            <linearGradient id="farmerChartArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ae4938" stopOpacity="0.34" />
              <stop offset="100%" stopColor="#ae4938" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <path d={area} fill="url(#farmerChartArea)" />
          <path d={line} fill="none" stroke="#ae4938" strokeWidth="1.8" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </svg>

        {active != null && <span className="farmer-chart-band" style={{ left: `${X(active)}%` }} />}

        {data.map((d, i) => (
          <button
            key={d.m}
            type="button"
            className="farmer-chart-dot"
            style={{ left: `${X(i)}%`, top: `${Y(d.v)}%` }}
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
            onBlur={() => setActive(null)}
            aria-label={`${d.m}: ₦${d.v} thousand revenue`}
          />
        ))}

        {active != null && (
          <div
            className="farmer-chart-tooltip"
            style={{ left: `${Math.min(Math.max(X(active), 14), 86)}%`, top: `${Y(data[active].v)}%` }}
          >
            <b>{data[active].m}</b>
            <span>₦{data[active].v}K</span>
          </div>
        )}
      </div>

      <div className="farmer-chart-labels">
        {data.map((d, i) => (
          <span key={d.m} className={i === data.length - 1 ? 'last' : ''}>{d.m}</span>
        ))}
      </div>
    </>
  )
}

function ActivityRow({ entry }: { entry: ActivityItem }) {
  const color = TYPE_COLOR[entry.type] || TYPE_COLOR.order
  const pillBg: Record<string, string> = {
    order: '#f6e2d6',
    scan: '#eedaf4',
    consent: '#ffead5',
  }
  const pillColor: Record<string, string> = {
    order: '#80372e',
    scan: '#a02cbd',
    consent: '#d97a05',
  }
  return (
    <div className="farmer-activity-row">
      <div className="farmer-activity-icon" style={{ background: color }}>{TYPE_ICON[entry.type] || '•'}</div>
      <div className="farmer-activity-information">
        <div className="farmer-activity-title">{entry.title}</div>
        <div className="farmer-activity-meta">{entry.meta}</div>
      </div>
      <span className="farmer-activity-status-pill" style={{ background: pillBg[entry.type] || pillBg.order, color: pillColor[entry.type] || pillColor.order }}>
        {entry.status}
      </span>
    </div>
  )
}

export function FarmerDashboard() {
  const [passport, setPassport] = useState<Passport | null>(null)
  const [timeline, setTimeline] = useState<TimelineEntry[]>([])

  useEffect(() => {
    api<Passport>('/api/passport').then(setPassport).catch(() => undefined)
    api<TimelineEntry[]>('/api/passport/timeline').then(setTimeline).catch(() => undefined)
  }, [])

  const data = {
    lifetimeRevenue: passport?.lifetimeRevenue ?? 2100000,
    recentRevenue: passport?.recentRevenue ?? 680000,
    transactionCount: passport?.transactionCount ?? 46,
    completedOrders: passport?.completedOrders ?? 44,
    fulfillmentRate: passport?.fulfillmentRate ?? 96,
    repeatCustomerCount: passport?.repeatCustomerCount ?? 29,
    averageRating: passport?.averageRating ?? 4.8,
    qualityConsistency: passport?.qualityConsistency ?? 91,
    activeMonths: passport?.activeMonths ?? 14,
    feap: passport?.feap ?? 78,
    profileMaturity: passport?.profileMaturity ?? 85,
  }

  const [tier, tierColor] = bandOf(data.feap)

  const groupedTimeline = useMemo(() => {
    return timeline.reduce<Record<string, TimelineEntry[]>>((acc, entry) => {
      const date = formatDate(entry.occurredAt)
      if (!acc[date]) acc[date] = []
      acc[date].push(entry)
      return acc
    }, {})
  }, [timeline])

  const timelineDays = Object.keys(groupedTimeline)

  const ring = useMemo(() => {
    const size = 118
    const r = size / 2 - 9
    const c = 2 * Math.PI * r
    const offset = c * (1 - Math.min(data.feap, 100) / 100)
    return { size, r, c, offset }
  }, [data.feap])

  const rightPanel = useMemo(
    () => (
      <aside>
      <div className="farmer-right-header">
        <div>
          <h2>Financial Passport</h2>
          <div className="farmer-right-description">Your farm&apos;s verified financial profile</div>
        </div>
        <div className="farmer-live-badge"><span className="farmer-live-dot" />Active</div>
      </div>

      <div className="farmer-feap-summary">
        <div className="farmer-feap-ring-wrap">
          <div className="farmer-feap-ring">
            <svg viewBox={`0 0 ${ring.size} ${ring.size}`} aria-hidden="true">
              <defs>
                <linearGradient id="farmerFeapGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#e0815f" />
                  <stop offset="100%" stopColor="#80372e" />
                </linearGradient>
              </defs>
              <circle cx={ring.size / 2} cy={ring.size / 2} r={ring.r} fill="none" stroke="#e9edf1" strokeWidth={9} />
              <circle
                cx={ring.size / 2}
                cy={ring.size / 2}
                r={ring.r}
                fill="none"
                stroke="url(#farmerFeapGrad)"
                strokeWidth={9}
                strokeLinecap="round"
                strokeDasharray={ring.c}
                strokeDashoffset={ring.offset}
              />
            </svg>
            <div className="farmer-feap-ring-center">
              <span className="farmer-feap-ring-value">{data.feap}</span>
              <span className="farmer-feap-ring-denom">/ 100</span>
            </div>
          </div>

          <div className="farmer-feap-ring-side">
            <div className="farmer-feap-label">Financial Economic Access Profile</div>
            <div className="farmer-feap-tier-chip" style={{ background: `${tierColor}1a`, color: tierColor }}>{tier}</div>
            <div className="farmer-progress-track">
              <div className="farmer-progress-fill" style={{ width: `${Math.min(data.feap, 100)}%`, background: `linear-gradient(90deg, ${tierColor}55, ${tierColor})` }} />
            </div>
            <div style={{ color: '#a2a8ae', fontFamily: 'var(--farmer-mono)', fontSize: 7.5, letterSpacing: '.05em', textTransform: 'uppercase', marginTop: 9 }}>
              Weighted across 6 verified signals
            </div>
          </div>
        </div>

        <div className="farmer-category-section">
          {FEAP_CATEGORIES.map((category) => (
            <div className="farmer-category" key={category.name}>
              <div className="farmer-category-header">
                <span className="farmer-category-name">{category.name}</span>
                <span className="farmer-category-value-pill" style={{ background: `${category.color}1c`, color: category.color }}>
                  {Math.round((category.weight / 100) * data.feap)}
                </span>
              </div>
              <div className="farmer-category-track">
                <div className="farmer-category-fill" style={{ width: `${category.weight}%`, background: `linear-gradient(90deg, ${category.color}88, ${category.color})` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="farmer-passport-card">
        <div className="farmer-passport-illustration">
          <div className="farmer-card-blue" />
          <div className="farmer-card-orange" />
          <div className="farmer-passport-stem" />
          <div className="farmer-leaf one" />
          <div className="farmer-leaf two" />
          <div className="farmer-leaf three" />
        </div>
        <div className="farmer-passport-title">Grow your financial profile</div>
        <p className="farmer-passport-text">
          Every verified order strengthens your Financial Passport and gives lenders a clearer picture of your farming business.
        </p>
        <Link className="farmer-passport-button" href="/farmer/passport">View passport</Link>
      </div>

      <div className="farmer-bottom-statistics">
        <div className="farmer-bottom-stat">
          <span className="farmer-bottom-stat-label">Lifetime revenue</span>
          <strong className="farmer-bottom-stat-value">{compactNaira(data.lifetimeRevenue)}</strong>
        </div>
        <div className="farmer-bottom-stat">
          <span className="farmer-bottom-stat-label">Repeat customers</span>
          <strong className="farmer-bottom-stat-value">{formatNumber(data.repeatCustomerCount)}</strong>
        </div>
      </div>
    </aside>
    ),
    [data.feap, tier, tierColor, data.lifetimeRevenue, data.repeatCustomerCount, ring],
  )

  useFarmerRightPanel(rightPanel)

  const metrics = [
    { icon: <ShoppingCart size={15} strokeWidth={2.4} />, color: '#ae4938', label: 'Verified orders', value: formatNumber(data.transactionCount), delta: '+6 this month', up: true },
    { icon: <CheckCircle2 size={15} strokeWidth={2.4} />, color: '#43b99e', label: 'Completed orders', value: formatNumber(data.completedOrders), delta: '98% on-time', up: true },
    { icon: <Truck size={15} strokeWidth={2.4} />, color: '#b63fd0', label: 'Fulfillment', value: `${data.fulfillmentRate}%`, delta: '+1.2% vs last quarter', up: true },
    { icon: <Star size={15} strokeWidth={2.4} />, color: '#ff8a0a', label: 'Average rating', value: `${data.averageRating.toFixed(1)}/5`, delta: '5 new reviews', flat: true },
  ]

  return (
    <>
      <header className="farmer-header">
        <div>
          <div className="farmer-eyebrow">
            <span className="farmer-eyebrow-dot" />
            Fresco farmer workspace
          </div>
          <h1>Dashboard</h1>
          <div className="farmer-subtitle">Ikorodu, Lagos · {data.activeMonths} months active</div>
        </div>

        <div className="farmer-header-actions">
          <button className="farmer-icon-button" type="button" aria-label="Notifications"><Bell size={16} strokeWidth={2} /></button>
          <Link className="farmer-manage-button" href="/farmer/produce">Manage listings</Link>
        </div>
      </header>

      <section className="farmer-hero-band">
        <div className="farmer-hero-glow" aria-hidden="true" />
        <div className="farmer-hero-rows">
          <div>
            <div className="farmer-hero-eyebrow"><span className="farmer-hero-dot" /> Verified economic activity</div>
            <div className="farmer-hero-value">{compactNaira(data.lifetimeRevenue)}</div>
            <div className="farmer-hero-sub">Lifetime revenue · {data.activeMonths} months active · Ikorodu, Lagos</div>
          </div>
          <div className="farmer-hero-side">
            <div className="farmer-hero-side-label">Recent 90 days</div>
            <div className="farmer-hero-side-value">{compactNaira(data.recentRevenue)}</div>
            <span className="farmer-hero-side-pill">▲ 12.4% vs prior period</span>
          </div>
        </div>
      </section>

      <div className="farmer-chart-card">
        <RevenueChart data={MONTHLY_REVENUE} />
      </div>

      <div className="farmer-metrics">
        {metrics.map((metric) => (
          <div className="farmer-metric" key={metric.label}>
            <div className="farmer-metric-icon" style={{ background: metric.color, boxShadow: `0 8px 16px ${metric.color}33` }}>
              {metric.icon}
            </div>
            <span className="farmer-metric-label">{metric.label}</span>
            <strong className="farmer-metric-value" style={{ color: metric.color }}>{metric.value}</strong>
            <span className={`farmer-metric-delta${metric.flat ? ' flat' : ' up'}`}>
              {metric.up && <ArrowUpRightMarker />}
              {metric.delta}
            </span>
          </div>
        ))}
      </div>

      <div className="farmer-activity">
        <div className="farmer-section-heading">
          <div className="farmer-section-heading-left">
            <span className="farmer-section-heading-title">Recent activity</span>
            <span className="farmer-section-heading-subtitle">Verified farm events</span>
          </div>
          <Link href="/farmer/history" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--farmer-blue)', fontSize: 10, fontWeight: 700, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '.05em' }}>
            See all <ChevronRight size={12} strokeWidth={2.5} />
          </Link>
        </div>

        {timelineDays.length === 0 ? (
          <div className="farmer-activity-list">
            {FALLBACK_ACTIVITY.map((group) => (
              <div key={group.day}>
                <div className="farmer-activity-day">{group.day}</div>
                {group.items.map((entry) => (
                  <ActivityRow key={`${entry.title}`} entry={entry} />
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="farmer-activity-list">
            {timelineDays.slice(0, 5).map((day) => (
              <div key={day}>
                <div className="farmer-activity-day">{day}</div>
                {groupedTimeline[day].map((entry) => (
                  <ActivityRow
                    key={`${entry.label}-${entry.occurredAt}`}
                    entry={{
                      type: entry.type,
                      title: entry.label,
                      meta: TYPE_LABEL[entry.type]
                        ? `${TYPE_LABEL[entry.type]} · ${new Date(entry.occurredAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}`
                        : new Date(entry.occurredAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' }),
                      status: entry.type === 'scan' ? 'Fresco' : entry.type === 'consent' ? 'Updated' : 'Verified',
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

function ArrowUpRightMarker() {
  return (
    <svg width="9" height="9" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M3 9 9 3M9 3H4.5M9 3v4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}