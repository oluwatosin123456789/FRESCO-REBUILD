'use client'

import { useState } from 'react'
import { FarmerButton, FarmerHeader, FarmerPill, FarmerTip } from '@/components/farmer/farmer-ui'
import { SCANS, type Scan } from '@/lib/seed/fresco-baseline'

const ART_BG: Record<string, string> = {
  tomato: '#F3E0D4',
  pepper: '#EFE3D0',
  greens: '#E6EDDC',
  cucumber: '#EBF0DC',
  crate: '#F3EAD9',
}

const ART_COLOR: Record<string, string> = {
  tomato: '#A33E1F',
  pepper: '#9A3E1F',
  greens: '#3F6B3A',
  cucumber: '#4E7A3A',
  crate: '#7A5130',
}

function artOf(s: Scan) {
  const n = s.produce.toLowerCase()
  if (n.includes('tomato')) return 'tomato'
  if (n.includes('pepper')) return 'pepper'
  if (n.includes('green')) return 'greens'
  if (n.includes('cucumber')) return 'cucumber'
  return 'crate'
}

function categoryOf(score: number) {
  return score >= 80 ? 'Very Fresh' : score >= 60 ? 'Fresh' : score >= 45 ? 'Fair' : 'Use soon'
}

export function ScanHistory() {
  const [scans] = useState<Scan[]>(SCANS.slice().reverse())

  return (
    <>
      {/* Hero banner */}
      <div style={{
        position: 'relative', borderRadius: 16, overflow: 'hidden',
        marginBottom: 24, height: 200,
        boxShadow: '0 4px 24px rgba(0,0,0,0.13)',
      }}>
        <img
          src="/assets/hero-scan-history.jpg"
          alt="Smartphone scanning a QR code on a vegetable crate with digital freshness score overlay"
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0) 25%, rgba(5,18,14,0.78) 100%)',
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '18px 24px',
        }}>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 4 }}>Fresco</div>
          <div style={{ color: '#fff', fontSize: 22, fontWeight: 750, letterSpacing: '-.3px', lineHeight: 1.1 }}>Scan history</div>
          <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12.5, marginTop: 4 }}>Past quality assessments · every one is evidence for your Passport</div>
        </div>
      </div>

      <FarmerHeader
        eyebrow="Fresco"
        title="Scan history"
        subtitle="Past Fresco quality assessments · every one is evidence attached to your Financial Passport"
        actions={<FarmerButton href="/farmer/scan">New scan</FarmerButton>}
      />

      {scans.length ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          {scans.map((s) => {
            const cat = s.category || categoryOf(s.freshness)
            const tone = s.freshness >= 80 ? 'green' : s.freshness >= 60 ? 'teal' : 'gold'
            return (
              <div className="farmer-row" key={s.id}>
                <div
                  className="farmer-row-art"
                  style={{ background: ART_BG[artOf(s)], color: ART_COLOR[artOf(s)] ?? '#7A5130' }}
                >
                  {s.produce.charAt(0)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <b style={{ fontWeight: 700, fontSize: 14, color: 'var(--farmer-ink)' }}>{s.produce}</b>
                    <span style={{ fontFamily: 'var(--farmer-mono)', fontSize: 9.5, color: 'var(--farmer-muted)' }}>{s.date}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'var(--farmer-ink2)', marginTop: 3, flexWrap: 'wrap' }}>
                    <b style={{ color: 'var(--farmer-teal)' }}>{s.freshness}%</b>
                    <FarmerPill tone={tone as 'green' | 'teal' | 'gold'}>{cat}</FarmerPill>
                    {s.used ? <FarmerPill tone="muted">used for a listing</FarmerPill> : null}
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--farmer-muted)', marginTop: 4 }}>
                    Est. shelf life: {s.shelfLife} days · {s.batch} · confidence {(s.confidence * 100).toFixed(0)}%
                  </div>
                </div>
                <span style={{ color: 'var(--farmer-muted)', fontSize: 16 }}>›</span>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="farmer-empty">
          <div className="farmer-empty-title">No scans yet</div>
          <div className="farmer-empty-sub">Open Fresco and capture your first crate.</div>
          <FarmerButton href="/farmer/scan">Start scanning</FarmerButton>
        </div>
      )}

      <div style={{ marginTop: 18 }}>
        <FarmerTip>
          <b>Honest by design.</b> Fresco contributes quality intelligence · never a financial decision. Estimates are AI-produced, not a laboratory test.
        </FarmerTip>
      </div>
    </>
  )
}