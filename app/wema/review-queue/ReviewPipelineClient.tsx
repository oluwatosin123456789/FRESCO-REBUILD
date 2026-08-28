'use client'

import Link from 'next/link'
import { Card, PageHeader } from '@/components/shared/frame-ui'
import { ACTIVE_COLUMNS, DECISION_STATES, SNAPSHOT, TERMINAL } from '@/lib/seed/dashboard.seed'

export default function ReviewPipelineClient() {
  return (
    <>
      <PageHeader
        eyebrow="REVIEW PIPELINE"
        title="16 profiles need attention"
        lede="Every card states why it surfaced. Decisions are recorded on the farmer's profile, with the evidence in front of the analyst."
      />

      <div className="wema-col-3">
        {ACTIVE_COLUMNS.map((col) => (
          <Card key={col.code}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div>
                <div style={{ font: '600 11px var(--mono)', letterSpacing: '.1em', color: 'var(--ink)' }}>{col.code}</div>
                <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{col.note}</div>
              </div>
              <b style={{ font: '700 22px var(--mono)', color: 'var(--ink)' }}>{col.count}</b>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {col.cards.map((card) => (
                <div key={card.name} style={{ border: '1px solid var(--line)', borderRadius: 12, padding: 12, background: 'var(--panel2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                    <b style={{ fontSize: 13, color: 'var(--ink)', minWidth: 0, overflowWrap: 'anywhere' }}>{card.name}</b>
                    <span style={{ font: '700 15px var(--mono)', color: 'var(--ink)', flexShrink: 0 }}>{card.feap}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', margin: '6px 0', overflowWrap: 'anywhere' }}>{card.reason}</div>
                  <span style={{ font: '600 10px var(--mono)', color: 'var(--muted)', overflowWrap: 'anywhere' }}>{card.meta}</span>
                </div>
              ))}
            </div>
          </Card>
        ))}

        <Card>
          <div style={{ font: '600 11px var(--mono)', letterSpacing: '.1em', color: 'var(--ink)' }}>DECIDED · LAST 30 DAYS</div>
          <div style={{ fontSize: 11.5, color: 'var(--muted)', margin: '4px 0 10px' }}>terminal states · the decision record keeps the full history</div>
          {TERMINAL.map((term) => (
            <div key={term.code} style={{ borderTop: '1px solid var(--line)', padding: '10px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <b style={{ font: '600 11px var(--mono)', color: 'var(--ink)', minWidth: 0, overflowWrap: 'anywhere' }}>{term.code}</b>
                <span style={{ fontWeight: 700, color: 'var(--ink)', flexShrink: 0 }}>{term.count}</span>
              </div>
              {term.rows.map((row) => (
                <div key={row.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap', padding: '4px 0', fontSize: 12 }}>
                  <span style={{ color: 'var(--ink2)', minWidth: 0, overflowWrap: 'anywhere' }}>{row.name}</span>
                  <span style={{ fontFamily: 'var(--mono)', color: 'var(--muted)', flexShrink: 0 }}>{row.ref}</span>
                </div>
              ))}
            </div>
          ))}
          <Link href="/wema/reports" style={{ color: 'var(--forest)', fontSize: 12.5, fontWeight: 600, textDecoration: 'none' }}>Full decision record →</Link>
        </Card>
      </div>

      <div className="wema-split-2-clean">
        <Card>
          <div style={{ font: '600 10px var(--mono)', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 10 }}>Decision states</div>
          {DECISION_STATES.map((s) => (
            <div key={s.code} style={{ display: 'flex', gap: 10, padding: '8px 0', borderTop: '1px solid var(--line)' }}>
              <b style={{ font: '600 11px var(--mono)', color: 'var(--ink)', flexShrink: 0, width: 150 }}>{s.code}</b>
              <span style={{ fontSize: 12.5, color: 'var(--ink2)' }}>{s.note}</span>
            </div>
          ))}
        </Card>
        <Card>
          <div style={{ font: '600 10px var(--mono)', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 10 }}>Evidence snapshot on decision</div>
          {SNAPSHOT.map((s) => (
            <div key={s.k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13, borderTop: '1px solid var(--line)' }}>
              <span style={{ color: 'var(--muted)' }}>{s.k}</span>
              <b style={{ color: 'var(--ink)' }}>{s.v}</b>
            </div>
          ))}
        </Card>
      </div>
    </>
  )
}
