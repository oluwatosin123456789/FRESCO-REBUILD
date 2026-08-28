'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { TopBar } from '@/components/wema/top-bar'
import { FARMERS, FILTERS } from '@/lib/seed/dashboard.seed'
import '@/styles/wema.css'

const COLUMNS = [
  { key: 'name', label: 'FARMER', width: 1.6 },
  { key: 'feap', label: 'FEAP', width: 0.5, align: 'right' },
  { key: 'activity', label: 'ACTIVITY', width: 1.2, padLeft: true },
  { key: 'fulfil', label: 'FULFILMENT', width: 0.8, align: 'right' },
  { key: 'spoilage', label: 'SPOILAGE', width: 0.8, align: 'right' },
  { key: 'screening', label: 'SCREENING', width: 1, padLeft: true },
  { key: 'consent', label: 'CONSENT', width: 1 },
  { key: 'action', label: 'ACTION', width: 0.7 },
]

export default function FarmersClient() {
  const searchParams = useSearchParams()
  const [searchValue, setSearchValue] = useState(() => searchParams.get('q') ?? '')
  const [notifOpen, setNotifOpen] = useState(false)

  const q = searchValue.trim().toLowerCase()
  const visible = q
    ? FARMERS.filter((f) => f.name.toLowerCase().includes(q) || f.farm.toLowerCase().includes(q))
    : FARMERS

  return (
    <div className="wema-main">
      <TopBar
        searchValue={searchValue}
        onSearch={setSearchValue}
        notifOpen={notifOpen}
        onToggleNotif={() => setNotifOpen(!notifOpen)}
      />

      <main className="wema-content">
        <header className="wema-page-header">
          <div>
            <div className="wema-page-tag">FARMERS</div>
            <h1 className="wema-page-title">Consented farmer register</h1>
          </div>
          <p className="wema-page-desc wema-page-desc--aside">
            Farmers without active consent are absent from this register, from counts and from portfolio distribution.
          </p>
        </header>

        <div className="wema-filters-bar">
          <span className="wema-filters-label">FILTERS</span>
          {FILTERS.map((f, i) => (
            <span key={i} className="wema-filter-chip">{f}</span>
          ))}
        </div>

        <div className="wema-farmers-table-wrapper">
          <div className="wema-farmers-table" role="table">
            <div className="wema-farmers-head" role="row">
              {COLUMNS.map((col) => (
                <span key={col.key} role="columnheader" className={`wema-farmers-col ${col.align ? 'align-right' : ''} ${col.padLeft ? 'pad-left' : ''}`} style={{ flex: col.width }}>
                  {col.label}
                </span>
              ))}
            </div>
            {visible.map((farmer) => (
              <Link key={farmer.id} href={`/wema/farmers/${farmer.id}`} className="wema-farmers-row" role="row">
                <div className="wema-farmers-col wema-farmers-farmer" style={{ flex: 1.6 }}>
                  <span className="wema-farmers-name">{farmer.name}</span>
                  <span className="wema-farmers-farm">{farmer.farm}</span>
                </div>
                <span className="wema-farmers-col align-right" style={{ flex: 0.5 }}>{farmer.feap}</span>
                <span className="wema-farmers-col pad-left" style={{ flex: 1.2 }}>{farmer.activity}</span>
                <span className="wema-farmers-col align-right" style={{ flex: 0.8 }}>{farmer.fulfil}</span>
                <span className="wema-farmers-col align-right" style={{ flex: 0.8 }}>{farmer.spoilage}</span>
                <span className="wema-farmers-col pad-left" style={{ flex: 1 }}>{farmer.screening}</span>
                <span className="wema-farmers-col" style={{ flex: 1 }}>
                  <span className={`wema-consent-glyph ${farmer.consentStyle}`} aria-hidden="true">
                    {farmer.consentStyle === 'full' ? '●' : '○'}
                  </span>
                  {farmer.consent}
                </span>
                <span className="wema-farmers-col" style={{ flex: 0.7 }}>
                  <button className="wema-btn wema-btn--tertiary">Open</button>
                </span>
              </Link>
            ))}

            {visible.length === 0 && (
              <div className="wema-empty" role="status">
                <h3>No farmers match “{searchValue}”</h3>
                <p>Try a name or a farm. The register only lists farmers with active consent.</p>
              </div>
            )}
          </div>

          <div className="wema-pagination">
            <span>Showing {visible.length} of 116 consented farmers</span>
            <div className="wema-pagination-controls">
              <button className="wema-pagination-btn" disabled>←</button>
              <button className="wema-pagination-btn active">1</button>
              <button className="wema-pagination-btn">2</button>
              <button className="wema-pagination-btn">→</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}