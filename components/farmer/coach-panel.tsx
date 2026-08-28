'use client'

import { useEffect, useState } from 'react'
import { FarmerHeader, FarmerPill, FarmerTip } from '@/components/farmer/farmer-ui'
import { METRICS } from '@/lib/seed/fresco-baseline'
import { api } from '@/lib/client-api'

type FarmerInsight = { summary: string; recommendations: Array<{ title: string; description: string; priority: 'high' | 'medium' | 'low' }> }
type DemandInsight = { topCategories: Array<{ category: string; count: number }>; weeklyOrderTrend: number; demandChangePercent: number }

const BASELINE_RECS = [
  { title: 'Stock more tomatoes before the peak window', description: 'Tomato demand is up 18% week-over-week. Inventory is what limits completed orders.', priority: 'high' as const },
  { title: 'Maintain 96%+ fulfillment', description: 'Your reliability is a core strength · protect it to keep FEAP steady.', priority: 'high' as const },
  { title: 'Convert repeat buyers with a pickup slot', description: `${METRICS.repeat} of your buyers returned. A dedicated slot could lift the repeat rate.`, priority: 'medium' as const },
]

const BASELINE_SUMMARY = 'Tomato demand has climbed 18% over three weeks. Your fulfillment is strong · inventory is what limits you.'

export function CoachPanel() {
  const [insight, setInsight] = useState<FarmerInsight | null>(null)
  const [demand, setDemand] = useState<DemandInsight | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    Promise.all([
      api<FarmerInsight>('/api/ai/farmer-coach', { method: 'POST' }).catch((e) => { if (!cancelled) setError(e.message); return null }),
      api<DemandInsight>('/api/ai/demand-insight').catch(() => null),
    ]).then(([i, d]) => {
      if (cancelled) return
      setInsight(i)
      setDemand(d)
    })
    return () => { cancelled = true }
  }, [])

  const summary = insight?.summary ?? BASELINE_SUMMARY
  const recs = insight?.recommendations ?? BASELINE_RECS
  const trend = demand?.demandChangePercent ?? 18
  const top = demand?.topCategories?.[0]?.category ?? 'Tomatoes'

  return (
    <>
      <FarmerHeader
        eyebrow="Growth Coach"
        title="Insights for Amaka Farms"
        subtitle="Built from your verified activity · never from credit logic. AI explains; deterministic rules decide"
        actions={<FarmerPill tone="gold">Deterministic fallback ready</FarmerPill>}
      />

      {error ? (
        <div style={{ marginBottom: 16 }}>
          <FarmerPill tone="orange">{error} · showing deterministic fallback</FarmerPill>
        </div>
      ) : null}

      <div className="farmer-grid">
        <div>
          <div className="farmer-card" style={{ background: '#111111', color: '#fff', border: 0 }}>
            <div className="farmer-label" style={{ color: 'var(--farmer-gold)', marginBottom: 12 }}>Summary</div>
            <div style={{ fontFamily: 'var(--farmer-serif)', fontWeight: 700, fontSize: 24, lineHeight: 1.3 }}>{summary}</div>
            <div style={{ fontSize: 13, color: '#b6bcc4', marginTop: 12, lineHeight: 1.55 }}>
              52% of your revenue comes from tomatoes. Peak buying is Wed–Sat. Current stock covers 4 days of demand.
            </div>
          </div>

          <div style={{ height: 14 }} />

          <div className="farmer-card">
            <div className="farmer-label" style={{ marginBottom: 14 }}>Demand insight · this week</div>
            <div style={{ display: 'flex', gap: 26 }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--farmer-muted)' }}>Top produce</div>
                <div style={{ fontFamily: 'var(--farmer-serif)', fontSize: 26, fontWeight: 700, color: 'var(--farmer-ink)' }}>{top}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--farmer-muted)' }}>Trend</div>
                <div style={{ fontFamily: 'var(--farmer-serif)', fontSize: 26, fontWeight: 700, color: 'var(--farmer-teal)' }}>▲ {trend}%</div>
              </div>
            </div>
            <div style={{ height: 118, display: 'flex', alignItems: 'flex-end', gap: 10, marginTop: 16 }}>
              {[24, 30, 28, 38, 44, 52].map((h, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, justifyContent: 'flex-end', height: '100%' }}>
                  <div style={{ width: '100%', height: `${h}%`, background: i >= 3 ? 'var(--farmer-blue)' : 'var(--farmer-blue-soft)', borderRadius: 3 }} />
                  <span style={{ fontFamily: 'var(--farmer-mono)', fontSize: 8.5, color: 'var(--farmer-muted)' }}>W-{i + 1}</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 12, color: 'var(--farmer-muted)', marginTop: 12 }}>Recommendation: increase inventory before the peak window.</div>
          </div>
        </div>

        <div className="farmer-card">
          <div className="farmer-label" style={{ marginBottom: 10 }}>Recommendations</div>
          <div>
            {recs.map((r, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 0' }}>
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    background: r.priority === 'high' ? 'var(--farmer-blue-soft)' : 'var(--farmer-purple-soft)',
                    border: `1px solid ${r.priority === 'high' ? '#b7d9fb' : '#e2c4ee'}`,
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                >
                  <span style={{ fontFamily: 'var(--farmer-mono)', fontWeight: 700, fontSize: 9.5, color: r.priority === 'high' ? 'var(--farmer-blue)' : 'var(--farmer-purple)' }}>
                    {r.priority === 'high' ? '!' : 'i'}
                  </span>
                </div>
                <div>
                  <div style={{ fontWeight: 650, fontSize: 13.5, color: 'var(--farmer-ink)' }}>{r.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--farmer-muted)', marginTop: 2, lineHeight: 1.5 }}>{r.description}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="farmer-divider" />
          <FarmerTip>
            <b>Autonomous Intelligence.</b> Recommendations evaluated against real-time harvest consistency and regional market demand signals.
          </FarmerTip>
        </div>
      </div>
    </>
  )
}