'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Btn, Card, CardGrid, Metric, PageHeader, Pill, ProgressBar, TipBar } from '@/components/shared/frame-ui'
import {
  FARMERS,
  NAIRA,
  OUTCOMES,
  PROFILE_KPIS,
  type ConsentScope,
  type Farmer,
  type FeapComponent,
  type InventoryItem,
} from '@/lib/seed/dashboard.seed'

const clamp = (n: number) => Math.min(99, Math.max(20, Math.round(n)))

const FULL_SCOPES: ConsentScope[] = [
  { name: 'TRANSACTION_HISTORY', state: 'Shared', stateStyle: { color: '#2e8b57' } },
  { name: 'REVENUE_HISTORY', state: 'Shared', stateStyle: { color: '#2e8b57' } },
  { name: 'FULFILLMENT_HISTORY', state: 'Shared', stateStyle: { color: '#2e8b57' } },
  { name: 'QUALITY_HISTORY', state: 'Shared', stateStyle: { color: '#2e8b57' } },
  { name: 'CUSTOMER_REPUTATION', state: 'Shared', stateStyle: { color: '#2e8b57' } },
  { name: 'FEAP', state: 'Shared', stateStyle: { color: '#2e8b57' } },
  { name: 'PROFILE_MATURITY', state: 'Shared', stateStyle: { color: '#2e8b57' } },
]

const PARTIAL_SCOPES: ConsentScope[] = FULL_SCOPES.map((scope) =>
  scope.name === 'CUSTOMER_REPUTATION'
    ? { ...scope, state: 'Not shared' as const, stateStyle: { color: '#b9820a', fontWeight: 500 } }
    : scope,
)

const GAP_BAR = 'repeating-linear-gradient(90deg,#e9ecef 0 4px,transparent 4px 8px)'

function consentScopesFor(farmer: Farmer): ConsentScope[] {
  if (farmer.consentScopes.length > 0) return farmer.consentScopes
  return farmer.consentStyle === 'partial' ? PARTIAL_SCOPES : FULL_SCOPES
}

function inventoryItemsFor(farmer: Farmer): InventoryItem[] {
  if (farmer.inventoryItems.length > 0) return farmer.inventoryItems
  return [
    { label: 'Active listings', value: `${farmer.activeListings}`, basis: 'currently LISTED', cohort: '' },
    { label: 'Committed to in-flight orders', value: `${NAIRA}${farmer.committedValue.toLocaleString()}`, basis: 'orders ACCEPTED, not yet delivered', cohort: '' },
    { label: 'Sell-through', value: `${farmer.sellThrough}%`, basis: 'listings sold before expiry', cohort: 'Portfolio median 74%' },
    { label: 'Median time to sale', value: `${farmer.medianTimeToSale} days`, basis: 'LISTED → first order', cohort: 'Portfolio median 6 days' },
    { label: 'Inventory turnover', value: `${farmer.inventoryTurnover}×`, basis: 'value sold ÷ average listed, monthly', cohort: '' },
    { label: 'Spoilage rate', value: farmer.spoilage, basis: 'listings reached EXPIRED unsold', cohort: 'Portfolio median 14%' },
    { label: 'Crop concentration', value: `${farmer.cropConcentration}%`, basis: 'largest crop share of revenue', cohort: 'Single-season exposure' },
    { label: 'Cancellations', value: `${farmer.cancellations} of ${farmer.acceptedOrders}`, basis: 'farmer- and buyer-initiated combined', cohort: '' },
  ]
}

function feapComponentsFor(farmer: Farmer): FeapComponent[] {
  if (farmer.feapComponents.length > 0) return farmer.feapComponents
  const customerTrustScore = farmer.consentStyle === 'full' ? clamp(farmer.feap + 5) : '·'
  const customerTrustEvidence =
    farmer.consentStyle === 'full'
      ? 'CUSTOMER_REPUTATION shared by farmer'
      : 'CUSTOMER_REPUTATION not shared by farmer. Shown as a gap, not a zero.'
  const customerTrustBar = customerTrustScore === '·' ? GAP_BAR : '#ae4938'
  return [
    { name: 'Transaction consistency', score: clamp(farmer.feap + 2), evidence: `${farmer.completedOrders} completed orders`, barWidth: clamp(farmer.feap + 2), barColor: '#ae4938' },
    { name: 'Sales performance', score: clamp(farmer.feap - 3), evidence: `${NAIRA}${farmer.revenue.toLocaleString()} total volume`, barWidth: clamp(farmer.feap - 3), barColor: '#ae4938' },
    { name: 'Fulfillment', score: farmer.fulfillmentRate, evidence: `${farmer.completedOrders} completed of ${farmer.acceptedOrders} accepted orders`, barWidth: farmer.fulfillmentRate, barColor: '#ae4938' },
    { name: 'Customer trust', score: customerTrustScore, evidence: customerTrustEvidence, barWidth: 100, barColor: customerTrustBar },
    { name: 'Produce quality', score: farmer.qualityScore, evidence: `Average freshness estimate ${farmer.qualityScore} across ${farmer.qualityScans} Fresco scans`, barWidth: farmer.qualityScore, barColor: '#ae4938' },
  ]
}

export default function FarmerProfileClient({ farmerId }: { farmerId: string }) {
  const [decision, setDecision] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const [committed, setCommitted] = useState(false)
  const [hint, setHint] = useState('')

  const farmer = FARMERS.find((f) => f.id === farmerId) ?? FARMERS[0]
  const scopes = consentScopesFor(farmer)
  const inventoryItems = inventoryItemsFor(farmer)
  const feapComponents = feapComponentsFor(farmer)
  const activeScopes = scopes.filter((s) => s.state === 'Shared').length
  const farmName = farmer.farm.split(' · ')[0]
  const monthsTracked = Math.max(1, farmer.feapHistory.length - 1)

  const needsReason = decision === 'NOT_REFERRED' || decision === 'MORE_ACTIVITY_NEEDED'

  const handleCommit = () => {
    if (!decision) {
      setHint('Choose an outcome first.')
      return
    }
    if (needsReason && !reason.trim()) {
      setHint('A reason is required for this outcome · it is returned to the farmer.')
      return
    }
    setCommitted(true)
    setHint('')
  }

  return (
    <>
      <Link href="/wema/farmers" style={{ font: '600 11px var(--mono)', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)', textDecoration: 'none', display: 'inline-block', marginBottom: 12 }}>
        ← Farmers / {farmer.id}
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14, marginBottom: 20 }}>
        <div>
          <h1 style={{ font: '700 clamp(26px,3vw,30px) var(--serif)', color: 'var(--ink)', margin: 0 }}>{farmer.name}</h1>
          <div style={{ font: '600 11px var(--mono)', color: 'var(--muted)', letterSpacing: '.08em', textTransform: 'uppercase', marginTop: 6 }}>
            {farmer.id} · {farmer.location.toUpperCase()} · EVIDENCE AS OF 18 AUG 2026
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ font: '600 10px var(--mono)', color: 'var(--muted)', letterSpacing: '.1em' }}>FEAP</div>
            <div style={{ font: '700 30px var(--serif)', color: 'var(--ink)', lineHeight: 1 }}>{farmer.feap}</div>
            <div style={{ font: '600 10px var(--mono)', color: 'var(--muted)' }}>{farmer.feapHistory.join(' → ')} · {monthsTracked} MO</div>
          </div>
          <Pill tone="ink">{farmer.band.toUpperCase()}</Pill>
        </div>
      </div>

      <CardGrid columns={4}>
        {PROFILE_KPIS.map((kpi) => (
          <Metric key={kpi.label} label={kpi.label} value={kpi.value} sub={kpi.basis} />
        ))}
      </CardGrid>

      <div style={{ height: 16 }} />

      <div className="wema-col-3">
        <Card>
          <div style={{ font: '600 10px var(--mono)', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 10 }}>Farm</div>
          {[
            ['Farm name', farmName],
            ['Location', farmer.location],
            ['Size', farmer.farmSize],
            ['Crops', farmer.crops.join(', ')],
            ['On platform since', farmer.onPlatformSince],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 12.5, borderTop: '1px solid var(--line)' }}>
              <span style={{ color: 'var(--muted)' }}>{k}</span>
              <b style={{ color: 'var(--ink)' }}>{v}</b>
            </div>
          ))}
        </Card>

        <Card>
          <div style={{ font: '600 10px var(--mono)', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 10 }}>Produce quality · Fresco</div>
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{ font: '700 34px var(--serif)', color: 'var(--ink)' }}>{farmer.qualityScore}</div>
            <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>average freshness estimate</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 60, marginTop: 10 }}>
            {[60, 72, 66, 84, 78, 88, 82, 90].map((h, i) => (
              <div key={i} style={{ flex: 1, height: `${h}%`, background: 'var(--forest)', borderRadius: 3, opacity: 0.85 }} />
            ))}
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 8 }}>
            Across {farmer.qualityScans} Fresco scans. Freshness figures are AI estimates, not laboratory verification.
          </div>
        </Card>

        <Card>
          <div style={{ font: '600 10px var(--mono)', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 10 }}>Consent</div>
          {scopes.map((scope) => (
            <div key={scope.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 12, borderTop: '1px solid var(--line)' }}>
              <span style={{ color: 'var(--ink2)' }}>{scope.name}</span>
              <b style={{ color: scope.stateStyle.color, fontWeight: scope.stateStyle.fontWeight ?? 600 }}>{scope.state}</b>
            </div>
          ))}
        </Card>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ font: '600 10px var(--mono)', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 12 }}>Inventory and working-capital evidence</div>
        <div className="wema-kpi-grid" style={{ gap: 12 }}>
          {inventoryItems.map((item) => (
            <div key={item.label} style={{ background: 'var(--panel2)', border: '1px solid var(--line)', borderRadius: 12, padding: 14 }}>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>{item.label}</div>
              <div style={{ font: '700 18px var(--serif)', color: 'var(--ink)', margin: '4px 0' }}>{item.value}</div>
              <div style={{ fontSize: 11.5, color: 'var(--ink2)' }}>{item.basis}</div>
              {item.cohort ? <div style={{ fontSize: 11, color: 'var(--green)', marginTop: 4 }}>{item.cohort}</div> : null}
            </div>
          ))}
        </div>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ font: '600 10px var(--mono)', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 12 }}>FEAP components and supporting evidence</div>
        <div className="wema-col-5">
          {feapComponents.map((comp) => (
            <div key={comp.name} style={{ border: '1px solid var(--line)', borderRadius: 12, padding: 14 }}>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--ink)' }}>{comp.name}</div>
              <div style={{ font: '700 20px var(--mono)', color: 'var(--ink)', margin: '6px 0' }}>{comp.score}</div>
              <ProgressBar width={comp.barWidth} color={comp.barColor} />
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8, lineHeight: 1.4 }}>{comp.evidence}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div style={{ font: '600 10px var(--mono)', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 12 }}>
          Record referral decision · {activeScopes} of 7 scopes active
        </div>
        <div className="wema-col-3" style={{ marginBottom: 14 }}>
          {OUTCOMES.map((outcome) => (
            <button
              key={outcome.code}
              type="button"
              onClick={() => { setDecision(outcome.code); setCommitted(false) }}
              style={{
                border: `1px solid ${decision === outcome.code ? 'var(--ink)' : 'var(--line)'}`,
                background: decision === outcome.code ? 'var(--canvas)' : 'var(--panel2)',
                borderRadius: 12,
                padding: 14,
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              <div style={{ font: '600 12px var(--mono)', color: 'var(--ink)' }}>{outcome.code}</div>
              <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 4 }}>{outcome.note}</div>
            </button>
          ))}
        </div>
        {needsReason ? (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>Reason · required. Returned to the farmer in the passport&apos;s own language, with the figures.</div>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="e.g. 14 more completed orders needed (6 of 20) and one more active month."
              style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid var(--line)', fontSize: 13, fontFamily: 'var(--sans)', resize: 'vertical' }}
            />
          </div>
        ) : null}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Btn tone="dark" onClick={handleCommit}>Freeze snapshot & record</Btn>
          {hint ? <span style={{ fontSize: 12.5, color: 'var(--clay)' }}>{hint}</span> : null}
        </div>
        {committed ? (
          <div style={{ marginTop: 14, background: 'var(--green-bg)', border: '1px solid #c9e6cf', borderRadius: 12, padding: 14 }}>
            <b style={{ color: 'var(--green)', fontSize: 13 }}>EV-00143 SEALED · READ-ONLY</b>
            <div style={{ fontSize: 12.5, color: 'var(--green)', marginTop: 4 }}>
              Recorded 19 Aug 2026 · 24 values frozen · FEAP-v1.0 · {activeScopes} of 7 scopes active. Six weeks from now, this answers &quot;what did the analyst actually see.&quot;
            </div>
          </div>
        ) : null}
      </Card>

      <div style={{ marginTop: 16 }}>
        <TipBar>
          <div>
            This profile reflects observed agricultural business activity on Fresco. Wema Bank performs independent underwriting and makes all financial decisions. The strongest claim made here is that the farmer is potentially eligible for bank review.
          </div>
        </TipBar>
      </div>
    </>
  )
}
