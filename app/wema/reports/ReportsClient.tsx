'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/wema/top-bar'
import { PACKS, AUDIT, SCHEDULED } from '@/lib/seed/dashboard.seed'
import '@/styles/wema.css'

export default function ReportsClient() {
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
            <div className="wema-page-tag">REPORTS</div>
            <h1 className="wema-page-title">The decision record</h1>
            <p className="wema-page-desc">
              Every referral decision, its sealed evidence snapshot, and the audit trail behind it. Reports here are records, not analytics.
            </p>
          </div>
          <button className="wema-btn wema-btn--dark">Generate pack</button>
        </header>

        <section className="wema-panel wema-panel--full" aria-labelledby="packs-heading">
          <div className="wema-packs-table" role="table">
            <div className="wema-packs-head" role="row">
              <span role="columnheader" style={{ flex: '0.9fr' }}>SNAPSHOT</span>
              <span role="columnheader" style={{ flex: '1.2fr' }}>FARMER</span>
              <span role="columnheader" style={{ flex: '1.1fr' }}>DECISION</span>
              <span role="columnheader" className="align-right" style={{ flex: '0.5fr' }}>FEAP</span>
              <span role="columnheader" className="align-right" style={{ flex: '0.8fr' }}>VERSION</span>
              <span role="columnheader" className="pad-left" style={{ flex: '0.9fr' }}>RECORDED</span>
              <span role="columnheader" style={{ flex: '0.7fr' }}></span>
            </div>
            {PACKS.map((pack, i) => (
              <div key={i} className="wema-packs-row" role="row">
                <span className="wema-packs-id" style={{ flex: '0.9fr' }}>{pack.id}</span>
                <div style={{ flex: '1.2fr' }}>
                  <div className="wema-packs-farmer">{pack.farmer}</div>
                  <div className="wema-packs-scopes">{pack.scopes}</div>
                </div>
                <span className="wema-packs-decision" style={{ flex: '1.1fr' }}>{pack.decision}</span>
                <span className="align-right" style={{ flex: '0.5fr' }}>{pack.feap}</span>
                <span className="align-right" style={{ flex: '0.8fr' }}>{pack.version}</span>
                <span className="pad-left" style={{ flex: '0.9fr' }}>{pack.recorded}</span>
                <div style={{ flex: '0.7fr', textAlign: 'right' }}>
                  <button className="wema-btn wema-btn--tertiary" style={{ minHeight: '30px', padding: '0 12px' }}>Download</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="wema-split">
          <section className="wema-panel" aria-labelledby="audit-heading">
            <div className="wema-panel-header-simple">
              <span className="wema-panel-title-small">AUDIT TRAIL</span>
            </div>
            <div className="wema-panel-body">
              <dl className="wema-audit-list">
                {AUDIT.map((item, i) => (
                  <div key={i} className="wema-audit-row">
                    <dt className="wema-audit-when">{item.when}</dt>
                    <dd className="wema-audit-what">{item.what}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>

          <section className="wema-panel" aria-labelledby="scheduled-heading">
            <div className="wema-panel-header-simple">
              <span className="wema-panel-title-small">SCHEDULED REPORTS</span>
            </div>
            <div className="wema-panel-body">
              <dl className="wema-scheduled-list">
                {SCHEDULED.map((item, i) => (
                  <div key={i} className="wema-scheduled-row">
                    <div>
                      <div className="wema-scheduled-name">{item.name}</div>
                      <div className="wema-scheduled-detail">{item.detail}</div>
                    </div>
                    <dd className="wema-scheduled-cadence">{item.cadence}</dd>
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