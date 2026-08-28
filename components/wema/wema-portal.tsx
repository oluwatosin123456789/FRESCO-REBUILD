'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AlertTriangle, ClipboardCheck, Download, Gauge, ShieldCheck, Sprout, Users, Wallet } from 'lucide-react'
import { Btn, Card, Divider, Metric, PageHeader, Pill, ProgressBar, TipBar } from '@/components/shared/frame-ui'
import {
  ATTENTION_ITEMS,
  AUDIT,
  CROPS,
  DECISION_STATES,
  FARMERS,
  MEDIANS,
  PACKS,
  POLICIES,
  SCHEDULED,
  SNAPSHOT,
  STATES,
  TEAM,
  THRESHOLDS,
} from '@/lib/seed/dashboard.seed'

type Tab = 'overview' | 'farmers' | 'analytics' | 'pipeline' | 'reports' | 'settings'

const VOLUME_BARS = [
  { m: 'JAN', l: 22, s: 14 },
  { m: 'FEB', l: 26, s: 18 },
  { m: 'MAR', l: 35, s: 28 },
  { m: 'APR', l: 42, s: 34 },
  { m: 'MAY', l: 55, s: 44 },
  { m: 'JUN', l: 62, s: 54 },
  { m: 'JUL', l: 78, s: 68 },
  { m: 'AUG', l: 88, s: 80 },
]

const MATURITY_BANDS = [
  { label: 'Emerging', count: 34 },
  { label: 'Building', count: 25 },
  { label: 'Developing', count: 28 },
  { label: 'Established', count: 21 },
  { label: 'Strong', count: 8 },
]

const BAND_COLORS = ['#b98a72', '#e0815f', '#ae4938', '#8f3a2b', '#111111']

const KPI_CARDS: { label: string; value: string; delta: string; icon: React.ReactNode; trend?: 'up' | 'down' }[] = [
  { label: 'REGISTERED FARMERS', value: '342', delta: 'platform register · +18 this month', icon: <Users size={14} strokeWidth={2.2} />, trend: 'up' },
  { label: 'ACTIVE CONSENT', value: '116', delta: '34% of register · 3 partial scopes', icon: <ShieldCheck size={14} strokeWidth={2.2} /> },
  { label: 'CONSENTED VOLUME', value: '₦21.4M', delta: '▲ +12.4% vs prior 8 months · 116 farmers', icon: <Wallet size={14} strokeWidth={2.2} />, trend: 'up' },
  { label: 'REVIEW PIPELINE', value: '16', delta: '9 awaiting first look', icon: <ClipboardCheck size={14} strokeWidth={2.2} /> },
]

const TAB_ROUTES: Record<Tab, string> = {
  overview: '/wema',
  farmers: '/wema/farmers',
  analytics: '/wema/analytics',
  pipeline: '/wema/review-queue',
  reports: '/wema/reports',
  settings: '/wema/settings',
}

function smoothLine(pts: readonly (readonly [number, number])[]): string {
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

function initialsFor(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
}

const AVATAR_PALETTE = [
  'linear-gradient(135deg,#ae4938,#80372e)',
  'linear-gradient(135deg,#315642,#1e3829)',
  'linear-gradient(135deg,#8c6a2f,#5b4620)',
  'linear-gradient(135deg,#4a4a4a,#1c1c1c)',
]

function Avatar({ name, size = 30 }: { name: string; size?: number }) {
  const palette = AVATAR_PALETTE[name.charCodeAt(0) % AVATAR_PALETTE.length]
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: palette,
        color: '#fff',
        display: 'inline-grid',
        placeItems: 'center',
        font: `700 ${size >= 34 ? 12 : 10.5}px var(--mono)`,
        letterSpacing: '.02em',
        flexShrink: 0,
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.14)',
      }}
    >
      {initialsFor(name)}
    </span>
  )
}

function VolumeChart() {
  const [active, setActive] = useState<number | null>(null)
  const X = (i: number) => (i / (VOLUME_BARS.length - 1)) * 100
  const Y = (v: number) => 100 - v * 0.92
  const listed = VOLUME_BARS.map((b, i) => [X(i), Y(b.l)] as const)
  const sold = VOLUME_BARS.map((b, i) => [X(i), Y(b.s)] as const)
  const listedPath = smoothLine(listed)
  const soldPath = smoothLine(sold)
  const soldArea = `${soldPath} L 100 100 L 0 100 Z`

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <div style={{ font: '700 22px var(--serif)', color: 'var(--ink)' }}>₦21.4M</div>
          <Pill tone="green">▲ +12.4% vs prior 8 months</Pill>
        </div>
        <div style={{ display: 'flex', gap: 14, fontSize: 11.5, color: 'var(--muted)' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 9, height: 9, borderRadius: 3, background: '#d8cdb4' }} /> Value listed</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 9, height: 9, borderRadius: 3, background: 'var(--farmer-blue)' }} /> Volume sold</span>
        </div>
      </div>

      <div className="wema-chart">
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className="wema-chart-gridline" style={{ top: `${(i / 4) * 100}%` }} />
        ))}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="wema-chart-svg" aria-hidden="true">
          <defs>
            <linearGradient id="wemaSoldArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ae4938" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#ae4938" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <path d={soldArea} fill="url(#wemaSoldArea)" />
          <path d={listedPath} fill="none" stroke="#cfc5ad" strokeWidth="1.5" strokeDasharray="1.5 3.5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          <path d={soldPath} fill="none" stroke="#ae4938" strokeWidth="2" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </svg>

        {VOLUME_BARS.map((b, i) => (
          <button
            key={b.m}
            type="button"
            className="wema-chart-dot"
            style={{ left: `${X(i)}%`, top: `${Y(b.s)}%` }}
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
            onBlur={() => setActive(null)}
            aria-label={`${b.m}: value listed ${b.l}, volume sold ${b.s}`}
          />
        ))}

        {active != null && (
          <div className="wema-chart-tooltip" style={{ left: `${Math.min(Math.max(X(active), 14), 86)}%`, top: `${Y(VOLUME_BARS[active].s)}%` }}>
            <b>{VOLUME_BARS[active].m}</b>
            <span>Sold {VOLUME_BARS[active].s}% · Listed {VOLUME_BARS[active].l}%</span>
          </div>
        )}
      </div>

      <div className="wema-chart-labels">
        {VOLUME_BARS.map((b) => (
          <span key={b.m}>{b.m}</span>
        ))}
      </div>
    </>
  )
}

function MaturityDonut() {
  const total = MATURITY_BANDS.reduce((s, b) => s + b.count, 0)
  const size = 150
  const r = size / 2 - 14
  const c = 2 * Math.PI * r

  const segments = MATURITY_BANDS.map((band, i) => {
    const frac = band.count / total
    const start = MATURITY_BANDS.slice(0, i).reduce((s, b) => s + b.count / total, 0)
    return { band, frac, start }
  })

  return (
    <div className="wema-donut-wrap">
      <div className="wema-donut">
        <svg viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
          {segments.map((seg, i) => (
            <circle
              key={seg.band.label}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={BAND_COLORS[i]}
              strokeWidth={13}
              strokeDasharray={`${(seg.frac * c).toFixed(2)} ${c.toFixed(2)}`}
              strokeDashoffset={(-seg.start * c).toFixed(2)}
              strokeLinecap="butt"
            />
          ))}
        </svg>
        <div className="wema-donut-center">
          <b>{total}</b>
          <span>consented</span>
        </div>
      </div>
      <div className="wema-donut-legend">
        {MATURITY_BANDS.map((band, i) => (
          <div className="wema-legend-row" key={band.label}>
            <span className="sw" style={{ background: BAND_COLORS[i] }} />
            <span className="nm">{band.label}</span>
            <span className="ct">{band.count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function WemaPortal({ initialTab = 'overview' }: { initialTab?: Tab }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>(initialTab)
  const [toast, setToast] = useState('')

  const goTo = (tab: Tab) => {
    setActiveTab(tab)
    router.push(TAB_ROUTES[tab])
  }

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const title: Record<Tab, [string, string, string]> = {
    overview: ['OVERVIEW', 'Agricultural activity portfolio', 'Fresco assembles evidence. Wema makes decisions. All figures cover the 116 farmers with active consent.'],
    farmers: ['FARMERS', 'Consented farmer register', 'Farmers without active consent are absent from this register, from counts and from portfolio distribution.'],
    analytics: ['ANALYTICS', 'Portfolio baselines', 'The medians an analyst compares a single profile against. Computed across the 116 farmers with active consent.'],
    pipeline: ['REVIEW PIPELINE', 'Opportunity underwriting board', 'Every card states why it surfaced. Decisions are recorded on the farmer profile with the evidence in front of the analyst.'],
    reports: ['REPORTS', 'The decision record', 'Every referral decision, its sealed evidence snapshot, and the audit trail behind it.'],
    settings: ['SETTINGS', 'Screening configuration', 'Thresholds are set by Wema through its own governance and evaluated deterministically on Fresco.'],
  }

  const [eyebrow, heading, lede] = title[activeTab]

  return (
    <>
      {toast ? (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 50, background: '#111111', color: '#fff', padding: '12px 16px', borderRadius: 12, border: '1px solid rgba(174,73,56,.4)', fontSize: 12.5 }}>
          {toast}
        </div>
      ) : null}

      <PageHeader eyebrow={eyebrow} title={heading} lede={lede} />

        {activeTab === 'overview' && <OverviewTab onGoto={goTo} />}
        {activeTab === 'farmers' && <FarmersTab />}
        {activeTab === 'analytics' && <AnalyticsTab />}
        {activeTab === 'pipeline' && <PipelineTab onDecide={(name) => showToast(`Decision recorded for ${name}`)} />}
        {activeTab === 'reports' && <ReportsTab />}
        {activeTab === 'settings' && <SettingsTab />}
    </>
  )
}

function OverviewTab({ onGoto }: { onGoto: (t: Tab) => void }) {
  return (
    <>
      <div className="wema-hero">
        <div className="wema-hero-inner">
          <div>
            <div className="wema-hero-eyebrow"><span className="dot" /> Fresco · consented portfolio</div>
            <div className="wema-hero-title">₦21.4M</div>
            <div className="wema-hero-sub">Consented transaction volume · 116 farmers · last 8 months</div>
          </div>
          <div className="wema-hero-stats">
            <div className="wema-hero-stat">
              <div className="k">Active consent</div>
              <div className="v">116</div>
            </div>
            <div className="wema-hero-stat">
              <div className="k">Portfolio median FEAP</div>
              <div className="v">63</div>
            </div>
            <div className="wema-hero-stat">
              <div className="k">Referred this week</div>
              <div className="v gold">5</div>
            </div>
          </div>
        </div>
      </div>

      <div className="wema-kpi-grid">
        {KPI_CARDS.map((kpi) => (
          <Metric key={kpi.label} label={kpi.label} value={kpi.value} sub={kpi.delta} icon={kpi.icon} trend={kpi.trend} />
        ))}
      </div>

      <div className="wema-split">
        <Card>
          <div className="wema-card-title" style={{ marginBottom: 6 }}>Transaction volume · consented farmers</div>
          <VolumeChart />
        </Card>

        <Card>
          <div className="wema-card-title" style={{ marginBottom: 18 }}>Profile maturity · 116 consented</div>
          <MaturityDonut />
        </Card>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div className="wema-card-title">Attention</div>
          <button type="button" onClick={() => onGoto('pipeline')} style={{ border: 0, background: 'none', color: 'var(--forest)', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
            Review pipeline →
          </button>
        </div>
        {ATTENTION_ITEMS.map((a) => (
          <div className="wema-attention" key={a.name}>
            <Avatar name={a.name} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <b style={{ color: 'var(--ink)', fontSize: 13 }}>{a.name}</b>
                <span style={{ font: '700 11px var(--mono)', color: 'var(--clay)', flexShrink: 0 }}>FEAP {a.feap}</span>
              </div>
              <div className="wema-attention-reason">{a.reason}</div>
              <div className="wema-attention-meta">
                <Pill tone="warn">In review</Pill>
              </div>
            </div>
          </div>
        ))}
      </Card>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div className="wema-card-title">Consented farmers active ledger</div>
          <button type="button" onClick={() => onGoto('farmers')} style={{ border: 0, background: 'none', color: 'var(--forest)', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
            View all 116 →
          </button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="wema-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--line)' }}>
                {['Farmer ID', 'Name', 'FEAP', 'Fulfilment', 'Volume', 'Status'].map((h) => (
                  <th key={h} style={{ font: '600 10px var(--mono)', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)', textAlign: 'left', padding: '8px 12px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FARMERS.slice(0, 4).map((f) => (
                <tr key={f.id} style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '8px 12px', font: '600 11px var(--mono)', color: 'var(--ink2)' }}>{f.id}</td>
                  <td style={{ padding: '8px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar name={f.name} size={26} />
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{f.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>{f.location}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '8px 12px', font: '700 14px var(--mono)', color: 'var(--ink)' }}>{f.feap}</td>
                  <td style={{ padding: '8px 12px', color: 'var(--ink2)' }}>{f.fulfil}</td>
                  <td style={{ padding: '8px 12px', fontFamily: 'var(--mono)', color: 'var(--ink2)' }}>{f.volume.toLocaleString()}</td>
                  <td style={{ padding: '8px 12px' }}><Pill tone={f.consentStyle === 'full' ? 'green' : 'warn'}>{f.band}</Pill></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}

function FarmersTab() {
  return (
    <Card>
      <div style={{ overflowX: 'auto' }}>
        <table className="wema-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--line)' }}>
              {['Farmer ID', 'Name', 'FEAP', 'Fulfilment', 'Volume', 'Screening', 'Consent', ''].map((h) => (
                <th key={h} style={{ font: '600 10px var(--mono)', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)', textAlign: 'left', padding: '10px 12px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FARMERS.map((f) => (
              <tr key={f.id} style={{ borderBottom: '1px solid var(--line)' }}>
                <td style={{ padding: '10px 12px', font: '600 11px var(--mono)', color: 'var(--ink2)' }}>{f.id}</td>
                <td style={{ padding: '10px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar name={f.name} size={28} />
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{f.name}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{f.location}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '10px 12px', font: '700 15px var(--mono)', color: 'var(--ink)' }}>{f.feap}</td>
                <td style={{ padding: '10px 12px', color: 'var(--ink2)' }}>{f.fulfil}</td>
                <td style={{ padding: '10px 12px', fontFamily: 'var(--mono)', color: 'var(--ink2)' }}>₦{(f.volume / 1000000).toFixed(2)}M</td>
                <td style={{ padding: '10px 12px', color: 'var(--ink2)' }}>{f.screening}</td>
                <td style={{ padding: '10px 12px' }}><Pill tone={f.consentStyle === 'full' ? 'green' : 'warn'}>{f.consent}</Pill></td>
                <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                  <Link href={`/wema/farmers/${f.id}`} style={{ color: 'var(--forest)', fontWeight: 600, fontSize: 12.5, textDecoration: 'none' }}>
                    Review profile
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function AnalyticsTab() {
  return (
    <>
      <div className="wema-kpi-grid">
        {MEDIANS.map((m) => (
          <Metric key={m.label} label={m.label} value={m.value} sub={m.note} />
        ))}
      </div>

      <div className="wema-split-2">
        <Card>
          <div className="wema-card-title" style={{ marginBottom: 14 }}>Revenue by crop · consented farmers</div>
          {CROPS.map((crop) => (
            <div key={crop.name} style={{ marginBottom: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 5 }}>
                <span style={{ color: 'var(--ink)', fontWeight: 600 }}>{crop.name}</span>
                <b style={{ color: 'var(--ink)' }}>{crop.value}</b>
              </div>
              <ProgressBar width={crop.barWidth * 3} color={crop.barColor} height={7} />
            </div>
          ))}
          <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 10 }}>
            Concentration matters for working capital: a farmer with most revenue in one crop carries a single-season exposure.
          </div>
        </Card>

        <Card>
          <div className="wema-card-title" style={{ marginBottom: 14 }}>Spoilage signal · portfolio median 14%</div>
          <div className="wema-grid-3">
            {[
              { n: '11', l: 'above 20%', icon: <AlertTriangle size={15} strokeWidth={2.2} />, color: '#b3541e' },
              { n: '38', l: '10–20%', icon: <Gauge size={15} strokeWidth={2.2} />, color: 'var(--ink)' },
              { n: '67', l: 'below 10%', icon: <Sprout size={15} strokeWidth={2.2} />, color: '#315642' },
            ].map((tile) => (
              <div key={tile.l} style={{ textAlign: 'center', background: 'var(--canvas)', borderRadius: 12, padding: '16px 12px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 9, background: 'color-mix(in srgb, ' + tile.color + ' 12%, transparent)', color: tile.color, marginBottom: 10 }}>{tile.icon}</span>
                <div style={{ font: '700 22px var(--serif)', color: tile.color }}>{tile.n}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>{tile.l}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <div className="wema-card-title" style={{ marginBottom: 10 }}>Distribution by state · 116 consented farmers</div>
        <div style={{ overflowX: 'auto' }}>
          <table className="wema-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--line)' }}>
                {['State', 'Farmers', 'Volume', 'Med. FEAP', 'Med. spoilage', 'In review'].map((h) => (
                  <th key={h} style={{ font: '600 10px var(--mono)', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)', textAlign: 'left', padding: '8px 12px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {STATES.map((s) => (
                <tr key={s.name} style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--ink)' }}>{s.name}</td>
                  <td style={{ padding: '8px 12px', color: 'var(--ink2)' }}>{s.farmers}</td>
                  <td style={{ padding: '8px 12px', color: 'var(--ink2)' }}>{s.volume}</td>
                  <td style={{ padding: '8px 12px', color: 'var(--ink2)' }}>{s.feap}</td>
                  <td style={{ padding: '8px 12px', color: 'var(--ink2)' }}>{s.spoilage}</td>
                  <td style={{ padding: '8px 12px', color: 'var(--ink2)' }}>{s.review}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}

function PipelineTab({ onDecide }: { onDecide: (name: string) => void }) {
  return (
    <>
      <div className="wema-split-2">
        {[
          { code: 'SUBMITTED', note: 'awaiting first look', count: '9', cards: [
            { name: 'Blessing Eze', feap: '55', reason: 'One order short of the 20-order threshold; all other signals cleared.', meta: '2 DAYS IN STATE' },
            { name: 'Yusuf Bello', feap: '63', reason: 'Fulfilment recovered to 88% after two missed windows in June.', meta: '1 DAY IN STATE' },
            { name: 'Halima Yusuf', feap: '57', reason: 'Spoilage improved to 17% after two months above 20%.', meta: '4 DAYS IN STATE' },
          ] },
          { code: 'UNDER_REVIEW', note: 'analyst assigned', count: '7', cards: [
            { name: 'Amaka Okafor', feap: '79', reason: 'All eight thresholds cleared; spoilage 11% against portfolio median 14%.', meta: 'K. ADEBAYO · 3 DAYS' },
            { name: 'Ibrahim Sule', feap: '74', reason: 'Highest turnover in queue: 2.4× monthly, sell-through 91%.', meta: 'K. ADEBAYO · 1 DAY' },
            { name: 'Tunde Balogun', feap: '61', reason: 'Spoilage 26% and rising for three months · working-capital signal to inspect.', meta: 'N. OYELARAN · 2 DAYS' },
          ] },
        ].map((col) => (
          <Card key={col.code}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <div style={{ font: '600 11px var(--mono)', letterSpacing: '.1em', color: 'var(--ink)' }}>{col.code}</div>
                <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{col.note}</div>
              </div>
              <b style={{ font: '700 22px var(--mono)', color: 'var(--ink)' }}>{col.count}</b>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {col.cards.map((card) => (
                <div key={card.name} style={{ border: '1px solid var(--line)', borderRadius: 12, padding: 14, background: 'var(--panel2)', transition: 'box-shadow .16s ease, transform .16s ease' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar name={card.name} size={30} />
                      <b style={{ fontSize: 13.5, color: 'var(--ink)' }}>{card.name}</b>
                    </div>
                    <span style={{ font: '700 15px var(--mono)', color: 'var(--ink)' }}>{card.feap}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', margin: '4px 0 10px' }}>{card.reason}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ font: '600 10.5px var(--mono)', color: 'var(--muted)' }}>{card.meta}</span>
                    <button type="button" onClick={() => onDecide(card.name)} style={{ border: 0, background: 'var(--dark)', color: '#fff', borderRadius: 7, padding: '6px 10px', fontSize: 11.5, fontWeight: 600, cursor: 'pointer' }}>
                      Underwrite
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <div className="wema-split-2-clean">
        <Card>
          <div className="wema-card-title" style={{ marginBottom: 8 }}>Decision states</div>
          {DECISION_STATES.map((s) => (
            <div key={s.code} style={{ display: 'flex', gap: 10, padding: '8px 0', borderTop: '1px solid var(--line)' }}>
              <b style={{ font: '600 11px var(--mono)', color: 'var(--ink)', flexShrink: 0, width: 150 }}>{s.code}</b>
              <span style={{ fontSize: 12.5, color: 'var(--ink2)' }}>{s.note}</span>
            </div>
          ))}
        </Card>
        <Card>
          <div className="wema-card-title" style={{ marginBottom: 8 }}>Evidence snapshot on decision</div>
          {SNAPSHOT.map((s) => (
            <div key={s.k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13, borderTop: '1px solid var(--line)' }}>
              <span style={{ color: 'var(--muted)' }}>{s.k}</span>
              <b style={{ color: 'var(--ink)' }}>{s.v}</b>
            </div>
          ))}
        </Card>
      </div>
    </>
  )
}

function ReportsTab() {
  return (
    <>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="wema-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--line)' }}>
                {['Snapshot', 'Farmer', 'Decision', 'FEAP', 'Version', 'Recorded', ''].map((h) => (
                  <th key={h} style={{ font: '600 10px var(--mono)', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)', textAlign: 'left', padding: '10px 12px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PACKS.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '10px 12px', font: '600 11px var(--mono)', color: 'var(--ink2)' }}>{p.id}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar name={p.farmer} size={26} />
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{p.farmer}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>{p.scopes}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '10px 12px' }}><Pill tone={p.decision === 'REFERRED_TO_WEMA' ? 'green' : p.decision === 'UNDER_REVIEW' ? 'warn' : 'muted'}>{p.decision}</Pill></td>
                  <td style={{ padding: '10px 12px', font: '700 14px var(--mono)', color: 'var(--ink)' }}>{p.feap}</td>
                  <td style={{ padding: '10px 12px', fontFamily: 'var(--mono)', color: 'var(--ink2)' }}>{p.version}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--ink2)' }}>{p.recorded}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right' }}><Btn tone="outline" small><Download size={13} strokeWidth={2.2} /> Download</Btn></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="wema-split-2-clean">
        <Card>
          <div className="wema-card-title" style={{ marginBottom: 8 }}>Audit trail</div>
          {AUDIT.map((a) => (
            <div key={a.what} style={{ display: 'flex', gap: 12, padding: '7px 0', borderTop: '1px solid var(--line)' }}>
              <span style={{ font: '600 10.5px var(--mono)', color: 'var(--muted)', flexShrink: 0, width: 84 }}>{a.when}</span>
              <span style={{ fontSize: 12.5, color: 'var(--ink)', minWidth: 0 }}>{a.what}</span>
            </div>
          ))}
        </Card>
        <Card>
          <div className="wema-card-title" style={{ marginBottom: 8 }}>Scheduled reports</div>
          {SCHEDULED.map((s) => (
            <div key={s.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, padding: '8px 0', borderTop: '1px solid var(--line)' }}>
              <div style={{ minWidth: 0 }}>
                <b style={{ fontSize: 13, color: 'var(--ink)' }}>{s.name}</b>
                <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{s.detail}</div>
              </div>
              <Pill tone="ink">{s.cadence}</Pill>
            </div>
          ))}
        </Card>
      </div>
    </>
  )
}

function SettingsTab() {
  return (
    <>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="wema-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--line)' }}>
                {['Signal', 'Threshold', 'Source', 'Farmers clearing'].map((h) => (
                  <th key={h} style={{ font: '600 10px var(--mono)', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)', textAlign: 'left', padding: '10px 14px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {THRESHOLDS.map((t) => (
                <tr key={t.signal} style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--ink)' }}>{t.signal}</td>
                  <td style={{ padding: '10px 14px', fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--ink2)' }}>{t.value}</td>
                  <td style={{ padding: '10px 14px', fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--ink2)' }}>{t.source}</td>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--ink)' }}>{t.clearing}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="wema-split-2-clean">
        <Card>
          <div className="wema-card-title" style={{ marginBottom: 8 }}>Consent policy</div>
          {POLICIES.map((p) => (
            <div key={p.name} style={{ padding: '8px 0', borderTop: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <b style={{ fontSize: 13, color: 'var(--ink)' }}>{p.name}</b>
                <Pill tone="green">{p.state}</Pill>
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>{p.detail}</div>
            </div>
          ))}
        </Card>
        <Card>
          <div className="wema-card-title" style={{ marginBottom: 8 }}>Analyst access</div>
          {TEAM.map((m) => (
            <div key={m.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderTop: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Avatar name={m.name} size={26} />
                <b style={{ fontSize: 13, color: 'var(--ink)' }}>{m.name}</b>
              </div>
              <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>{m.role}</span>
            </div>
          ))}
          <Divider />
          <TipBar>
            <div><b>Screening answers activity thresholds</b> · never whether a farmer should receive credit. Wema decides independently.</div>
          </TipBar>
        </Card>
      </div>
    </>
  )
}