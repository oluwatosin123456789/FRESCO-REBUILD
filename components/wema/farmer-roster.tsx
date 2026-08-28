import { FARMERS } from '@/lib/seed/dashboard.seed'
import Link from 'next/link'

export function FarmerRoster() {
  return (
    <section className="wema-roster" aria-labelledby="roster-heading">
      <div className="wema-roster-header">
        <span className="wema-roster-title">FARMERS WITH ACTIVE CONSENT</span>
        <div className="wema-roster-meta">
          <span className="wema-roster-count">116 OF 342 REGISTERED</span>
          <Link href="/wema/farmers" className="wema-roster-link">See all farmers →</Link>
        </div>
      </div>
      <div className="wema-roster-table" role="table">
        <div className="wema-roster-head" role="row">
          <span role="columnheader">FARMER</span>
          <span role="columnheader" className="wema-roster-feap">FEAP</span>
          <span role="columnheader" className="wema-roster-activity">ACTIVITY</span>
          <span role="columnheader" className="wema-roster-screening">SCREENING</span>
          <span role="columnheader" className="wema-roster-consent">CONSENT</span>
          <span role="columnheader" className="wema-roster-action">ACTION</span>
        </div>
        {FARMERS.slice(0, 5).map((farmer) => (
          <div key={farmer.id} className="wema-roster-row" role="row">
            <div className="wema-roster-farmer">
              <span className="wema-roster-name">{farmer.name}</span>
              <span className="wema-roster-farm">{farmer.farm}</span>
            </div>
            <span className="wema-roster-feap">{farmer.feap}</span>
            <span className="wema-roster-activity">{farmer.activity}</span>
            <span className="wema-roster-screening">{farmer.screening}</span>
            <span className="wema-roster-consent">
              <span className={`wema-consent-glyph ${farmer.consentStyle}`} aria-hidden="true">
                {farmer.consentStyle === 'full' ? '●' : '○'}
              </span>
              {farmer.consent.replace('reputation ', '')}
            </span>
            <div className="wema-roster-action">
              <Link href={`/wema/farmers/${farmer.id}`} className="wema-btn wema-btn--tertiary">Review profile</Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}