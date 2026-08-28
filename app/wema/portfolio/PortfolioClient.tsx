'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/wema/top-bar'
import { KpiCard } from '@/components/wema/kpi-card'
import { VolumeChart } from '@/components/wema/volume-chart-proto'
import { ProfileMaturity } from '@/components/wema/profile-maturity'
import { AttentionStrip } from '@/components/wema/attention-strip-proto'
import { FarmerRoster } from '@/components/wema/farmer-roster'
import { KPIS } from '@/lib/seed/dashboard.seed'
import '@/styles/wema.css'

export default function PortfolioClient() {
  const router = useRouter()
  const [searchValue, setSearchValue] = useState('')
  const [notifOpen, setNotifOpen] = useState(false)

  const volumeMonths = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG']
  const valueListed = [1200000, 1500000, 1800000, 2200000, 2800000, 3200000, 3600000, 4000000]
  const volumeSold = [900000, 1200000, 1400000, 1800000, 2400000, 2800000, 3100000, 3400000]

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
            <div className="wema-page-tag">OVERVIEW</div>
            <h1 className="wema-page-title">Agricultural activity portfolio</h1>
            <p className="wema-page-desc">
              Fresco assembles evidence. Wema makes decisions. All portfolio figures below cover the 116 farmers with active consent · unconsented farmers are absent, not greyed out.
            </p>
          </div>
          <div className="wema-page-period">JAN – AUG 2026</div>
        </header>

        <div className="wema-kpi-grid" role="list" aria-label="Key portfolio metrics">
          {KPIS.map((kpi, i) => (
            <KpiCard key={i} label={kpi.label} value={kpi.value} delta={kpi.delta} />
          ))}
        </div>

        <div className="wema-split">
          <section className="wema-panel" aria-labelledby="volume-heading">
            <div className="wema-panel-header">
              <span className="wema-panel-title">TRANSACTION VOLUME · CONSENTED FARMERS</span>
              <span className="wema-panel-delta"><span className="positive">▲ +12.4%</span> vs prior 8 months</span>
            </div>
            <div className="wema-panel-body">
              <div className="wema-volume-header">
                <div>
                  <div className="wema-volume-total-label">Total consented volume</div>
                  <div className="wema-volume-total">₦21.4M</div>
                </div>
                <div className="wema-volume-controls">
                  <div className="wema-period-toggle">
                    <button className="wema-period-btn">3M</button>
                    <button className="wema-period-btn active">ALL</button>
                    <button className="wema-period-btn">12M</button>
                  </div>
                  <div className="wema-volume-legend-inline">
                    <span className="wema-legend-item-inline">
                      <span className="wema-legend-dot wema-legend-dot--listed" />
                      Value listed
                    </span>
                    <span className="wema-legend-item-inline">
                      <span className="wema-legend-dot wema-legend-dot--sold" />
                      Volume sold
                    </span>
                  </div>
                </div>
              </div>
              <VolumeChart months={volumeMonths} valueListed={valueListed} volumeSold={volumeSold} />
              <p className="wema-volume-note">
                Value listed is the total ask of listings created that month; volume sold is the value of completed orders. One tick = ₦200,000. The gap between the pair is the working-capital story ·{' '}
                <a href="/wema/analytics" className="wema-inline-link">see spoilage in Analytics →</a>
              </p>
            </div>
          </section>

          <ProfileMaturity />
        </div>

        <AttentionStrip />

        <FarmerRoster />
      </main>
    </div>
  )
}