'use client'

import { useEffect, useState } from 'react'
import { FarmerButton, FarmerHeader, FarmerPill } from '@/components/farmer/farmer-ui'
import { CONSENT, type Consent } from '@/lib/seed/fresco-baseline'
import { api } from '@/lib/client-api'

type ApiConsent = { id: string; institution: string; status: string; scopes: string[]; grantedAt: string; expiresAt?: string | null }

const SCOPES = [
  { k: 'order', label: 'Order History', d: 'Verified orders and payments' },
  { k: 'revenue', label: 'Revenue History', d: 'Monthly revenue from orders' },
  { k: 'quality', label: 'Quality History', d: 'Fresco scans and freshness' },
  { k: 'feap', label: 'FEAP', d: 'Economic activity profile score' },
  { k: 'fulfillment', label: 'Fulfillment', d: 'Delivery reliability' },
  { k: 'reputation', label: 'Reputation', d: 'Ratings and repeat buyers' },
]

export function ConsentManager() {
  const [consent, setConsent] = useState<Consent>(CONSENT)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    api<ApiConsent[]>('/api/consent')
      .then((data) => {
        const wema = Array.isArray(data) ? data.find((c) => c.institution === 'WEMA_BANK' || c.institution === 'Wema Bank') : undefined
        if (!wema) return
        setConsent((prev) => ({
          ...prev,
          status: wema.status === 'GRANTED' ? 'GRANTED' : 'REVOKED',
          grantedAt: wema.grantedAt ? new Date(wema.grantedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : prev.grantedAt,
        }))
      })
      .catch(() => undefined)
  }, [])

  const granted = consent.status === 'GRANTED'
  const toggle = (k: string) => {
    setConsent((prev) => ({ ...prev, scopes: { ...prev.scopes, [k]: !prev.scopes[k] } }))
  }
  const grant = () => {
    setConsent((prev) => ({ ...prev, status: 'GRANTED' }))
    setNotice('Consent granted · Wema can now see the data you chose.')
  }
  const revoke = () => {
    setConsent((prev) => ({ ...prev, status: 'REVOKED' }))
    setNotice('Access revoked · Wema can no longer see this passport.')
  }

  const shared = SCOPES.filter((s) => consent.scopes[s.k])

  return (
    <>
      <FarmerHeader
        eyebrow="Consent"
        title="Who can see your passport?"
        subtitle="You share verified business activity. Wema decides independently what to do with it"
        actions={<FarmerPill tone={granted ? 'green' : 'red'}>{granted ? 'Access granted' : 'Access revoked'}</FarmerPill>}
      />

      {notice ? (
        <div style={{ marginBottom: 16 }}>
          <FarmerPill tone={granted ? 'green' : 'orange'}>{notice}</FarmerPill>
        </div>
      ) : null}

      <div className="farmer-grid">
        <div className="farmer-card">
          <div className="farmer-label" style={{ marginBottom: 12 }}>Your passport</div>
          <b style={{ fontFamily: 'var(--farmer-serif)', fontWeight: 700, fontSize: 18, color: 'var(--farmer-ink)' }}>Amaka Farms</b>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
            {SCOPES.map((s) => (
              <span className="farmer-chip" key={s.k}>{s.label}</span>
            ))}
          </div>
          <div style={{ fontFamily: 'var(--farmer-mono)', fontWeight: 600, fontSize: 10, color: 'var(--farmer-muted)', marginTop: 14 }}>
            All data derived from verified Fresco activity.
          </div>
        </div>

        <div className="farmer-card" style={{ background: granted ? '#f2f8f4' : '#fdf1f1', borderColor: granted ? '#d3e6d8' : '#f3d3d5' }}>
          <div className="farmer-label" style={{ marginBottom: 12, color: granted ? '#2e8b57' : '#d0343a' }}>Wema Bank · recipient</div>
          <b style={{ fontFamily: 'var(--farmer-serif)', fontWeight: 700, fontSize: 18, color: 'var(--farmer-ink)' }}>
            {granted ? 'Access granted' : 'Access revoked'}
          </b>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
            {shared.map((s) => (
              <span className="farmer-chip on" key={s.k}>{s.label}</span>
            ))}
            {shared.length === 0 ? <span style={{ fontSize: 12.5, color: 'var(--farmer-muted)' }}>No scopes shared</span> : null}
          </div>
          {granted ? (
            <div style={{ fontSize: 12.5, color: 'var(--farmer-ink2)', marginTop: 12 }}>
              Granted {consent.grantedAt} · Expires {consent.expiresAt}
            </div>
          ) : null}
          <div style={{ fontFamily: 'var(--farmer-mono)', fontWeight: 600, fontSize: 9.5, color: '#8C8C7A', marginTop: 10 }}>
            Farmer-initiated · revocable at any time
          </div>
        </div>
      </div>

      <div style={{ height: 16 }} />

      <div className="farmer-grid">
        <div className="farmer-card">
          <div className="farmer-label" style={{ marginBottom: 10 }}>Sharing scope</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {SCOPES.map((s) => (
              <div key={s.k} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 8px', borderRadius: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 650, color: 'var(--farmer-ink)' }}>{s.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--farmer-muted)' }}>{s.d}</div>
                </div>
                <button
                  type="button"
                  aria-label={`Toggle ${s.label}`}
                  aria-pressed={consent.scopes[s.k]}
                  className={`farmer-toggle${consent.scopes[s.k] ? ' on' : ''}`}
                  onClick={() => toggle(s.k)}
                />
              </div>
            ))}
          </div>
          <div className="farmer-divider" />
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <FarmerButton tone="blue" onClick={grant}>Grant to Wema</FarmerButton>
            <FarmerButton tone="danger" onClick={revoke}>Revoke access</FarmerButton>
          </div>
        </div>

        <div className="farmer-card">
          <div className="farmer-label" style={{ marginBottom: 10 }}>Audit trail</div>
          <div className="farmer-timeline">
            {consent.audit.slice().reverse().map((a, i) => (
              <div className="farmer-timeline-row" key={i}>
                <div className={`farmer-timeline-dot${i === 0 ? ' fill' : ''}`} />
                <div>
                  <div style={{ fontFamily: 'var(--farmer-mono)', fontSize: 10, color: 'var(--farmer-muted)' }}>{a.at}</div>
                  <div className="farmer-timeline-text">{a.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}