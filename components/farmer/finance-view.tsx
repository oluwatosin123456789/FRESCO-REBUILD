'use client'

import { useEffect, useState } from 'react'
import { FarmerButton, FarmerHeader, FarmerMetric, FarmerPill, FarmerStatusPill } from '@/components/farmer/farmer-ui'
import { FINANCE_REQUESTS, METRICS, ORDERS, feapCalc, fmtCompact, fmtFull, opportunityFor, type FinanceRequest } from '@/lib/seed/fresco-baseline'
import { api } from '@/lib/client-api'

type ApiFinanceRequest = { id: string; requestedAmount: number; status: string; createdAt: string; order?: { reference: string; total: number } | null }

export function FinanceView() {
  const [requests, setRequests] = useState<FinanceRequest[]>(FINANCE_REQUESTS)

  useEffect(() => {
    api<ApiFinanceRequest[]>('/api/wema/finance')
      .then((data) => {
        if (!Array.isArray(data) || data.length === 0) return
        setRequests(
          data.map((r) => ({
            id: r.id.slice(0, 12),
            orderId: r.order?.reference ?? '·',
            label: r.order?.reference ?? 'Order',
            amount: r.requestedAmount,
            status: r.status,
            date: new Date(r.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            note: '',
          }))
        )
      })
      .catch(() => undefined)
  }, [])

  const confirmed = ORDERS[0]
  const feap = feapCalc(METRICS)
  const opp = opportunityFor(METRICS)
  const cap = Math.round(confirmed.total * 0.4)

  return (
    <>
      <FarmerHeader
        eyebrow="Finance My Order"
        title="Working capital for verified orders"
        subtitle="Rooted in verified activity · consent-gated · institutional pipeline"
        actions={<FarmerPill tone="gold">Verified Opportunity</FarmerPill>}
      />

      <div className="farmer-grid">
        <div>
          <div className="farmer-card">
            <div className="farmer-label" style={{ marginBottom: 14 }}>Confirmed order</div>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <div
                className="farmer-row-art"
                style={{ background: '#F3EAD9', color: '#7A5130' }}
              >
                {confirmed.items[0].name.charAt(0)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <b style={{ fontSize: 14.5, color: 'var(--farmer-ink)' }}>{confirmed.items[0].name}</b>
                <div style={{ fontFamily: 'var(--farmer-mono)', fontSize: 10.5, color: 'var(--farmer-muted)', marginTop: 3 }}>
                  #{confirmed.id} · {confirmed.buyer} · confirmed
                </div>
              </div>
              <b style={{ fontFamily: 'var(--farmer-serif)', fontSize: 20, fontWeight: 700, color: 'var(--farmer-ink)' }}>{fmtCompact(confirmed.total)}</b>
            </div>
            <div className="farmer-divider" />
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: 13 }}>
              <span style={{ color: 'var(--farmer-ink2)' }}>Order value</span>
              <span style={{ fontWeight: 650, color: 'var(--farmer-ink)' }}>{fmtFull(confirmed.total)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '3px 0', fontSize: 13 }}>
              <span style={{ color: 'var(--farmer-ink2)' }}>Working-capital estimate (40%)</span>
              <span style={{ color: 'var(--farmer-blue)', fontFamily: 'var(--farmer-serif)', fontWeight: 700, fontSize: 19 }}>{fmtFull(cap)}</span>
            </div>
          </div>

          <div style={{ height: 14 }} />

          <div className="farmer-card">
            <div className="farmer-label" style={{ marginBottom: 14 }}>Your context</div>
            <div className="farmer-grid-3" style={{ marginBottom: 16 }}>
              <FarmerMetric label="FEAP" value={feap.score} sub="score" style={{ background: '#f6f8fa', borderColor: 'var(--farmer-line)' }} />
              <FarmerMetric label="Fulfillment" value={`${METRICS.fulfillment}%`} sub="reliability" style={{ background: '#f6f8fa', borderColor: 'var(--farmer-line)' }} />
              <FarmerMetric label="GMV" value={fmtCompact(METRICS.revenue)} sub="lifetime" style={{ background: '#f6f8fa', borderColor: 'var(--farmer-line)' }} />
            </div>
            <FarmerButton tone="blue" block>Request financing</FarmerButton>
            <div style={{ fontSize: 11, color: 'var(--farmer-muted)', textAlign: 'center', marginTop: 9 }}>
              Consent-gated underwriting · Wema Bank Agricultural Credit Protocol
            </div>
          </div>
        </div>

        <div>
          {opp.active ? (
            <div style={{ background: '#111111', color: '#fff', borderRadius: 14, padding: 24 }}>
              <div className="farmer-label" style={{ color: 'var(--farmer-gold)', marginBottom: 10 }}>Opportunity for Amaka Farms</div>
              <h3 style={{ fontFamily: 'var(--farmer-serif)', fontWeight: 700, fontSize: 21, margin: 0 }}>Working Capital Facility</h3>
              <div style={{ fontFamily: 'var(--farmer-serif)', fontWeight: 700, fontSize: 28, color: 'var(--farmer-gold)', marginTop: 8 }}>
                Up to {fmtFull(opp.amount)}
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '16px 0 0', display: 'flex', flexDirection: 'column', gap: 9 }}>
                {opp.matched.map((r) => (
                  <li key={r.label} style={{ fontSize: 12.5, color: '#c8cdd4', display: 'flex', gap: 9, alignItems: 'flex-start' }}>
                    <span style={{ color: 'var(--farmer-gold)', fontWeight: 700, flexShrink: 0 }}>✓</span>
                    <span>{r.detail}</span>
                  </li>
                ))}
                {opp.feapOk ? (
                  <li style={{ fontSize: 12.5, color: '#c8cdd4', display: 'flex', gap: 9 }}>
                    <span style={{ color: 'var(--farmer-gold)', fontWeight: 700, flexShrink: 0 }}>✓</span>
                    <span>FEAP {feap.score} <b style={{ color: '#fff' }}>≥ 70 · Established band</b></span>
                  </li>
                ) : null}
              </ul>
              <div style={{ marginTop: 18 }}>
                <FarmerButton tone="gold" block>Apply for Facility</FarmerButton>
              </div>
              <p style={{ fontSize: 10.5, color: '#7d8288', marginTop: 14, lineHeight: 1.6 }}>
                Agricultural Working Capital Facility underwritten by Wema Bank PLC based on immutable Financial Passport ledger records.
              </p>
            </div>
          ) : (
            <div className="farmer-empty" style={{ margin: '8px auto 0' }}>
              <div className="farmer-empty-title">No active opportunity yet</div>
              <div className="farmer-empty-sub">Complete more orders and re-check · the engine runs on your latest metrics.</div>
            </div>
          )}
        </div>
      </div>

      <div style={{ height: 18 }} />

      <div className="farmer-card" style={{ padding: 6 }}>
        <div className="farmer-label" style={{ padding: '16px 14px 6px' }}>My requests</div>
        <div style={{ overflowX: 'auto' }}>
          <table className="farmer-table">
            <thead>
              <tr>
                {['Reference', 'Order', 'Amount', 'Status'].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontFamily: 'var(--farmer-mono)', fontWeight: 600, fontSize: 11, color: 'var(--farmer-ink2)' }}>{r.id}</td>
                  <td style={{ color: 'var(--farmer-ink)' }}>{r.label}</td>
                  <td style={{ fontWeight: 700, color: 'var(--farmer-ink)' }}>{fmtCompact(r.amount)}</td>
                  <td>
                    {r.status === 'APPROVED' ? <FarmerStatusPill status="APPROVED" label="Wema Approved" /> : r.status === 'DECLINED' ? <FarmerStatusPill status="DECLINED" label="Review Concluded" /> : <FarmerPill tone="orange">Under Wema Review</FarmerPill>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}