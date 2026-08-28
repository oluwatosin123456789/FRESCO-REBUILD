'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/wema/top-bar'
import { MEDIANS, CROPS, STATES } from '@/lib/seed/dashboard.seed'
import '@/styles/wema.css'

export default function AnalyticsClient() {
  const router = useRouter()
  const [searchValue, setSearchValue] = useState('')
  const [notifOpen, setNotifOpen] = useState(false)

  const spoilageBins = [
    { range: '0–4', height: 26 },
    { range: '5–9', height: 54 },
    { range: '10–14', height: 88 },
    { range: '15–19', height: 100 },
    { range: '20–24', height: 62 },
    { range: '25–29', height: 38 },
    { range: '30–34', height: 22 },
    { range: '35+', height: 12 },
  ]

  return (
    <div className="wema-main">
      <TopBar
        searchValue={searchValue}
        onSearch={setSearchValue}
        onSearchSubmit={() => router.push(`/wema/farmers?q=${encodeURIComponent(searchValue)}`)}
        notifOpen={notifOpen}
        onToggleNotif={() => setNotifOpen(!notifOpen)}
      />

      <main className="wema-content">
        <header className="wema-page-header">
          <div>
            <div className="wema-page-tag">ANALYTICS</div>
            <h1 className="wema-page-title">Portfolio baselines</h1>
            <p className="wema-page-desc">
              The medians an analyst compares a single profile against. Computed across the 116 farmers with active consent.
            </p>
          </div>
        </header>

        <div className="wema-kpi-grid" role="list" aria-label="Portfolio medians">
          {MEDIANS.map((median, i) => (
            <div key={i} className="wema-kpi-card">
              <div className="wema-kpi-label">{median.label}</div>
              <div className="wema-kpi-value">{median.value}</div>
              <div className="wema-kpi-delta">{median.note}</div>
            </div>
          ))}
        </div>

        <div className="wema-split">
          <section className="wema-panel" aria-labelledby="crops-heading">
            <div className="wema-panel-header">
              <span className="wema-panel-title">REVENUE BY CROP · CONSENTED FARMERS</span>
            </div>
            <div className="wema-panel-body">
              <div className="wema-crops-list">
                {CROPS.map((crop, i) => (
                  <div key={i} className="wema-crop-row">
                    <div className="wema-crop-header">
                      <span className="wema-crop-name">{crop.name}</span>
                      <span className="wema-crop-value">{crop.value}</span>
                    </div>
                    <div className="wema-crop-bar-track">
                      <div
                        className="wema-crop-bar-fill"
                        style={{ width: `${crop.barWidth}%`, background: crop.barColor }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="wema-crops-note">
                Concentration matters for working capital: a portfolio, or a farmer, with most revenue in one crop carries a single-season exposure.
              </p>
            </div>
          </section>

          <section className="wema-panel" aria-labelledby="spoilage-heading">
            <div className="wema-panel-header">
              <span className="wema-panel-title">SPOILAGE DISTRIBUTION</span>
              <span className="wema-panel-meta">FARMERS</span>
            </div>
            <div className="wema-panel-body">
              <div className="wema-spoilage-chart" role="img" aria-label="Spoilage distribution histogram">
                {spoilageBins.map((bin, i) => (
                  <div
                    key={i}
                    className="wema-spoilage-bar"
                    style={{
                      height: `${bin.height}%`,
                      background: bin.height >= 100 ? '#4a8c3f' : bin.height >= 50 ? '#2d4739' : bin.height >= 25 ? '#c17d0a' : '#b3541e',
                    }}
                  />
                ))}
              </div>
              <div className="wema-spoilage-x-axis">
                {spoilageBins.map((bin) => (
                  <span key={bin.range}>{bin.range}</span>
                ))}
              </div>
              <p className="wema-spoilage-note">
                Share of listings that reached EXPIRED unsold, per farmer. Portfolio median 14%. Derived from listing expiry records, not self-reported.
              </p>
            </div>
          </section>
        </div>

        <section className="wema-panel wema-panel--full" aria-labelledby="states-heading">
          <div className="wema-panel-header">
            <span className="wema-panel-title">DISTRIBUTION BY STATE</span>
            <span className="wema-panel-meta">116 CONSENTED FARMERS</span>
          </div>
          <div className="wema-states-table" role="table">
            <div className="wema-states-head" role="row">
              <span role="columnheader" style={{ flex: '1.2fr' }}>STATE</span>
              <span role="columnheader" className="align-right" style={{ flex: '0.8fr' }}>FARMERS</span>
              <span role="columnheader" className="align-right" style={{ flex: '1fr' }}>VOLUME</span>
              <span role="columnheader" className="align-right" style={{ flex: '0.8fr' }}>MED. FEAP</span>
              <span role="columnheader" className="align-right" style={{ flex: '0.9fr' }}>MED. SPOILAGE</span>
              <span role="columnheader" className="pad-left" style={{ flex: '1fr' }}>IN REVIEW</span>
            </div>
            {STATES.map((state, i) => (
              <div key={i} className="wema-states-row" role="row">
                <span className="wema-states-name" style={{ flex: '1.2fr' }}>{state.name}</span>
                <span className="align-right" style={{ flex: '0.8fr' }}>{state.farmers}</span>
                <span className="align-right" style={{ flex: '1fr' }}>{state.volume}</span>
                <span className="align-right" style={{ flex: '0.8fr' }}>{state.feap}</span>
                <span className="align-right" style={{ flex: '0.9fr' }}>{state.spoilage}</span>
                <span className="pad-left" style={{ flex: '1fr' }}>{state.review}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}