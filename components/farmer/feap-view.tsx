'use client'

import { useEffect, useState } from 'react'
import { FarmerHeader, FarmerPill, FarmerTip } from '@/components/farmer/farmer-ui'
import { METRICS, bandOf, feapCalc, type Metrics } from '@/lib/seed/fresco-baseline'
import { api } from '@/lib/client-api'

type Passport = {
  completedOrders?: number
  fulfillmentRate?: number
  lifetimeRevenue?: number
  recentRevenue?: number
  averageRating?: number
  repeatCustomerCount?: number
  qualityConsistency?: number
  activeMonths?: number
  feap?: number
}

function FarmerRing({ score, size = 176 }: { score: number; size?: number }) {
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
        <div className="farmer-ring-value">{score}</div>
        <div className="farmer-ring-sub">/ 100</div>
      </div>
    </div>
  )
}

export function FeapView() {
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
    recentRevenue: passport?.recentRevenue ?? METRICS.recentRevenue,
  }
  const feap = feapCalc(m)
  const [tier, tierColor] = bandOf(feap.score)
  const sumParts = feap.parts.map((p) => Math.round(p.val)).join(' + ')

  return (
    <>
      <FarmerHeader
        eyebrow="FEAP · why this score?"
        title={
          <>
            {feap.score} / 100 <span style={{ color: tierColor, fontSize: '0.5em' }}>· {tier}</span>
          </>
        }
        subtitle="A deterministic, explainable measure of verified economic activity"
        actions={<FarmerPill tone="green">Deterministic · not a credit score</FarmerPill>}
      />

      <div className="farmer-grid">
        <div className="farmer-card" style={{ textAlign: 'center' }}>
          <div className="farmer-label" style={{ textAlign: 'left' }}>The total is the sum of its parts</div>
          <div style={{ display: 'grid', placeItems: 'center', margin: '18px 0 10px' }}>
            <FarmerRing score={feap.score} />
          </div>
          <div style={{ fontFamily: 'var(--farmer-mono)', fontSize: 11, color: 'var(--farmer-muted)' }}>
            {sumParts} = <b style={{ color: 'var(--farmer-ink)' }}>{feap.score}</b>
          </div>
          <div className="farmer-divider" />
          <div style={{ textAlign: 'left', fontSize: 12.5, color: 'var(--farmer-ink2)', lineHeight: 1.55 }}>
            Each point is traceable to a record in Amaka&apos;s verified activity. No LLM calculates this number.
          </div>
        </div>

        <div className="farmer-card">
          <div className="farmer-label" style={{ marginBottom: 8 }}>Weighted contributions</div>
          <div style={{ marginTop: 8 }}>
            {feap.parts.map((p) => (
              <div key={p.key} style={{ display: 'flex', gap: 11, padding: '9px 0' }}>
                <div className="farmer-timeline-dot fill" style={{ marginTop: 6 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <span style={{ fontWeight: 650, fontSize: 13.5, color: 'var(--farmer-ink)' }}>{p.label}</span>
                    <b style={{ fontFamily: 'var(--farmer-mono)', fontWeight: 700, fontSize: 12, color: 'var(--farmer-blue)' }}>{Math.round(p.val)}</b>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--farmer-muted)' }}>{p.detail} · weight {p.weight}%</div>
                  <div style={{ marginTop: 7 }}>
                    <div className="farmer-progress-track" style={{ height: 4, marginTop: 0 }}>
                      <div className="farmer-progress-fill" style={{ width: `${Math.round((p.val / p.weight) * 100)}%`, background: 'var(--farmer-blue)' }} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12 }}>
            <FarmerTip>
              <b>Honest limits.</b> FEAP measures recorded economic activity on Fresco. It is not a credit score, does not guarantee approval, and never replaces Wema&apos;s independent decisioning.
            </FarmerTip>
          </div>
        </div>
      </div>
    </>
  )
}