'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FarmerHeader, FarmerMetric, FarmerPill, FarmerTip } from '@/components/farmer/farmer-ui'
import { METRICS, bandOf, feapCalc, fmtCompact, type Metrics } from '@/lib/seed/fresco-baseline'
import { api } from '@/lib/client-api'

type Passport = {
  lifetimeRevenue?: number
  transactionCount?: number
  completedOrders?: number
  fulfillmentRate?: number
  averageRating?: number
  repeatCustomerCount?: number
  qualityConsistency?: number
  activeMonths?: number
  feap?: number
}

const BANDS = [
  ['Emerging', '#8C8C7A'],
  ['Building', '#f6b73c'],
  ['Developing', '#43bea2'],
  ['Established', '#1788f6'],
  ['Strong', '#111111'],
] as const

function PassportRing({ score, size = 150 }: { score: number; size?: number }) {
  const r = size / 2 - 8
  const c = 2 * Math.PI * r
  const off = c * (1 - score / 100)
  return (
    <div className="farmer-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e9edf1" strokeWidth={7} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--farmer-blue)"
          strokeWidth={7}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={off}
        />
      </svg>
      <div className="farmer-ring-center">
        <div className="farmer-ring-value" style={{ fontSize: 34 }}>{score}</div>
        <div className="farmer-ring-sub">/ 100</div>
      </div>
    </div>
  )
}

export function PassportView() {
  const [passport, setPassport] = useState<Passport | null>(null)

  useEffect(() => {
    api<Passport>('/api/passport').then(setPassport).catch(() => undefined)
  }, [])

  const m: Metrics = {
    revenue: passport?.lifetimeRevenue ?? METRICS.revenue,
    completed: passport?.completedOrders ?? METRICS.completed,
    fulfillment: passport?.fulfillmentRate ?? METRICS.fulfillment,
    rating: passport?.averageRating ?? METRICS.rating,
    repeat: passport?.repeatCustomerCount ?? METRICS.repeat,
    months: passport?.activeMonths ?? METRICS.months,
    avgFreshness: passport?.qualityConsistency ?? METRICS.avgFreshness,
    recentRevenue: METRICS.recentRevenue,
  }
  const feap = feapCalc(m)
  const [tier] = bandOf(feap.score)

  const milestones = [
    ['100+', 'Orders completed'],
    ['6 mo', 'Continuous activity'],
    ['72%', 'Repeat buyers'],
    ['₦1M', 'Revenue milestone'],
  ]

  return (
    <>
      <FarmerHeader
        eyebrow="Agricultural Financial Passport"
        title="Amaka Farms"
        subtitle="Amaka Okafor · Ikorodu, Lagos · built from verified activity on Fresco"
        actions={<FarmerPill tone="green">Not a credit score</FarmerPill>}
      />

      <div className="farmer-metrics">
        <FarmerMetric label="Total volume" value={fmtCompact(m.revenue)} sub="lifetime revenue" />
        <FarmerMetric label="Completed orders" value={m.completed} sub="verified transactions" />
        <FarmerMetric label="Fulfillment" value={`${m.fulfillment}%`} sub="accepted orders delivered" />
        <FarmerMetric label="Active" value={`${m.months} mo`} sub="business longevity" />
      </div>

      <div style={{ height: 18 }} />

      <div className="farmer-grid">
        <div className="farmer-card">
          <div className="farmer-label" style={{ marginBottom: 16 }}>FEAP · Farmer Economic Activity Profile</div>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <PassportRing score={feap.score} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {BANDS.map(([label, color]) => {
                  const on = tier === label
                  return (
                    <div className="farmer-band-row" key={label}>
                      <span className={`farmer-band-name${on ? ' on' : ''}`}>{label}</span>
                      <span className="farmer-band-track" style={{ opacity: on ? 1 : 0.4 }}>
                        <span
                          className="farmer-band-fill"
                          style={{ width: on ? `${Math.max(feap.score, 12)}%` : '8%', background: color }}
                        />
                      </span>
                    </div>
                  )
                })}
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--farmer-muted)', marginTop: 12 }}>{tier} · deterministic calculation · no AI involved</div>
            </div>
          </div>
          <div className="farmer-divider" />
          <Link href="/farmer/feap" className="farmer-button outline block">Why this score? · full explanation</Link>
        </div>

        <div className="farmer-card">
          <div className="farmer-label" style={{ marginBottom: 8 }}>What is building your profile</div>
          <div style={{ marginTop: 8 }}>
            {feap.parts.map((p) => (
              <div key={p.key} style={{ display: 'flex', gap: 11, padding: '9px 0' }}>
                <div className="farmer-timeline-dot fill" style={{ marginTop: 6 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <span style={{ fontWeight: 650, fontSize: 13.5, color: 'var(--farmer-ink)' }}>{p.label}</span>
                    <b style={{ fontFamily: 'var(--farmer-mono)', fontWeight: 700, fontSize: 11.5, color: 'var(--farmer-blue)' }}>{p.weight}%</b>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--farmer-muted)' }}>{p.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ height: 18 }} />

      <div className="farmer-grid">
        <div className="farmer-card">
          <div className="farmer-label" style={{ marginBottom: 8 }}>Timeline</div>
          <div className="farmer-timeline">
            {[
              ['18 Aug', '50kg tomatoes scanned · Fresco 92%'],
              ['18 Aug', 'Listing created · TOM-2026-030'],
              ['19 Aug', 'Order received · #HL1024'],
              ['19 Aug', '₦8,200 payment recorded'],
              ['20 Aug', 'Order fulfilled'],
              ['20 Aug', '5-star review received'],
            ].map(([d, t]) => (
              <div className="farmer-timeline-row" key={t}>
                <div className="farmer-timeline-dot" />
                <div className="farmer-timeline-text">
                  <b style={{ color: 'var(--farmer-ink2)' }}>{d}</b> <span style={{ color: 'var(--farmer-muted)' }}>· {t}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="farmer-card">
          <div className="farmer-label" style={{ marginBottom: 8 }}>Milestones reached</div>
          <div>
            {milestones.map(([v, t]) => (
              <div key={t} style={{ display: 'flex', gap: 11, padding: '9px 0', alignItems: 'center' }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--farmer-blue)', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 11, flexShrink: 0 }}>✓</div>
                <div className="farmer-timeline-text">
                  <b style={{ color: 'var(--farmer-ink)' }}>{v}</b> <span style={{ color: 'var(--farmer-muted)' }}>· {t}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="farmer-divider" />
          <FarmerTip>
            <b>Next opportunity</b> · complete a few more orders and the transaction-consistency component lifts FEAP toward 79.
          </FarmerTip>
        </div>
      </div>
    </>
  )
}