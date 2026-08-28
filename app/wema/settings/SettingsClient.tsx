'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/wema/top-bar'
import { THRESHOLDS, POLICIES, TEAM } from '@/lib/seed/dashboard.seed'
import '@/styles/wema.css'

export default function SettingsClient() {
  const router = useRouter()
  const [searchValue, setSearchValue] = useState('')
  const [notifOpen, setNotifOpen] = useState(false)

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
            <div className="wema-page-tag">SETTINGS</div>
            <h1 className="wema-page-title">Screening configuration</h1>
            <p className="wema-page-desc">
              Thresholds are set by Wema through its own governance and evaluated deterministically on Fresco. They are displayed here read-only. Screening answers whether a farmer meets the observable-activity thresholds the bank asked for · never whether a farmer should receive credit.
            </p>
          </div>
          <div className="wema-settings-badge">WEMA-AGRI-01 · v1.0 · ILLUSTRATIVE CONFIGURATION</div>
        </header>

        <section className="wema-panel wema-panel--full" aria-labelledby="thresholds-heading">
          <div className="wema-thresholds-table" role="table">
            <div className="wema-thresholds-head" role="row">
              <span role="columnheader" style={{ flex: '1.2fr' }}>SIGNAL</span>
              <span role="columnheader" style={{ flex: '1fr' }}>THRESHOLD</span>
              <span role="columnheader" style={{ flex: '1fr' }}>SOURCE</span>
              <span role="columnheader" className="align-right" style={{ flex: '1.1fr' }}>FARMERS CLEARING</span>
            </div>
            {THRESHOLDS.map((t, i) => (
              <div key={i} className="wema-thresholds-row" role="row">
                <span style={{ flex: '1.2fr' }}>{t.signal}</span>
                <span style={{ flex: '1fr' }}><code>{t.value}</code></span>
                <span style={{ flex: '1fr' }}><code>{t.source}</code></span>
                <span className="align-right" style={{ flex: '1.1fr' }}>{t.clearing}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="wema-split">
          <section className="wema-panel" aria-labelledby="policies-heading">
            <div className="wema-panel-header-simple">
              <span className="wema-panel-title-small">CONSENT POLICY</span>
            </div>
            <div className="wema-panel-body">
              <dl className="wema-policies-list">
                {POLICIES.map((p, i) => (
                  <div key={i} className="wema-policy-row">
                    <div>
                      <dt className="wema-policy-name">{p.name}</dt>
                      <dd className="wema-policy-detail">{p.detail}</dd>
                    </div>
                    <dd className="wema-policy-state">{p.state}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>

          <section className="wema-panel" aria-labelledby="scoring-heading">
            <div className="wema-panel-header-simple">
              <span className="wema-panel-title-small">SCORING AND ACCESS</span>
            </div>
            <div className="wema-panel-body">
              <dl className="wema-scoring-list">
                <div><dt>Score version</dt><dd><code>FEAP-v1.0</code></dd></div>
                <div><dt>Recompute</dt><dd>On every activity event</dd></div>
                <div><dt>Evidence refresh</dt><dd>Nightly, 03:00 WAT</dd></div>
                <div><dt>Snapshot retention</dt><dd>7 years, read-only</dd></div>
              </dl>
              <div className="wema-panel-divider" />
              <div className="wema-panel-header-simple">
                <span className="wema-panel-title-small">ANALYST ACCESS</span>
              </div>
              <dl className="wema-team-list">
                {TEAM.map((m, i) => (
                  <div key={i} className="wema-team-row">
                    <dt>{m.name}</dt>
                    <dd>{m.role}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}