// Dashboard seed data · mirrors the prototype exactly
// This is the single source of truth for all demo surfaces

export const NAIRA = '\u20A6'

export interface Farmer {
  id: string
  name: string
  farm: string
  location: string
  feap: number
  feapHistory: number[]
  band: string
  activity: string
  fulfil: string
  spoilage: string
  screening: string
  consent: string
  consentStyle: 'full' | 'partial'
  volume: number
  completedOrders: number
  acceptedOrders: number
  fulfillmentRate: number
  activeMonths: number
  qualityScore: number
  qualityScans: number
  crops: string[]
  farmSize: string
  onPlatformSince: string
  revenue: number
  sellThrough: number
  medianTimeToSale: number
  inventoryTurnover: number
  cropConcentration: number
  cancellations: number
  activeListings: number
  committedValue: number
  feapComponents: FeapComponent[]
  consentScopes: ConsentScope[]
  inventoryItems: InventoryItem[]
}

export interface FeapComponent {
  name: string
  score: string | number
  evidence: string
  barWidth: number
  barColor: string
}

export interface ConsentScope {
  name: string
  state: 'Shared' | 'Not shared'
  stateStyle: { color: string; fontWeight?: number }
}

export interface InventoryItem {
  label: string
  value: string
  basis: string
  cohort: string
}

export interface KpiItem {
  label: string
  value: string
  delta: string
}

export interface ProfileKpiItem {
  label: string
  value: string
  basis: string
}

export interface AttentionItem {
  name: string
  feap: string
  reason: string
}

export interface NotificationItem {
  text: string
  when: string
  dot: string
}

export interface NavItem {
  href: string
  label: string
  badge?: string
}

export interface CropItem {
  name: string
  value: string
  barWidth: number
  barColor: string
}

export interface StateItem {
  name: string
  farmers: string
  volume: string
  feap: string
  spoilage: string
  review: string
}

export interface PipelineColumn {
  code: string
  note: string
  count: string
  cards: PipelineCard[]
}

export interface PipelineCard {
  name: string
  feap: string
  reason: string
  meta: string
}

export interface TerminalItem {
  code: string
  count: string
  rows: { name: string; ref: string }[]
}

export interface DecisionState {
  code: string
  note: string
}

export interface SnapshotItem {
  k: string
  v: string
}

export interface PackItem {
  id: string
  farmer: string
  scopes: string
  decision: string
  feap: string
  version: string
  recorded: string
}

export interface AuditItem {
  when: string
  what: string
}

export interface ScheduledReport {
  name: string
  detail: string
  cadence: string
}

export interface ThresholdItem {
  signal: string
  value: string
  source: string
  clearing: string
}

export interface PolicyItem {
  name: string
  detail: string
  state: string
}

export interface TeamMember {
  name: string
  role: string
}

export interface MedianItem {
  label: string
  value: string
  note: string
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/wema/portfolio', label: 'Overview' },
  { href: '/wema/farmers', label: 'Farmers' },
  { href: '/wema/analytics', label: 'Analytics' },
  { href: '/wema/review-queue', label: 'Review Pipeline', badge: '16' },
  { href: '/wema/reports', label: 'Reports' },
  { href: '/wema/settings', label: 'Settings' },
]

export const KPIS: KpiItem[] = [
  { label: 'REGISTERED FARMERS', value: '342', delta: 'platform register · +18 this month' },
  { label: 'ACTIVE CONSENT', value: '116', delta: '34% of register · 3 partial scopes' },
  { label: 'CONSENTED VOLUME', value: `${NAIRA}21.4M`, delta: '▲ +12.4% vs prior 8 months · 116 farmers' },
  { label: 'REVIEW PIPELINE', value: '16', delta: '9 awaiting first look' },
]

export const FARMERS: Farmer[] = [
  {
    id: 'FR-FRM-00417',
    name: 'Amaka Okafor',
    farm: "Amaka's Farm · Ikorodu, Lagos",
    location: 'Ikorodu, Lagos',
    feap: 79,
    feapHistory: [61, 68, 74, 79],
    band: 'Established',
    activity: `${NAIRA}1.85M · 127 orders`,
    fulfil: '94%',
    spoilage: '11%',
    screening: 'Meets criteria',
    consent: 'All 7 scopes',
    consentStyle: 'full',
    volume: 1850000,
    completedOrders: 127,
    acceptedOrders: 135,
    fulfillmentRate: 94,
    activeMonths: 8,
    qualityScore: 82,
    qualityScans: 64,
    crops: ['Tomatoes', 'Pepper', 'Cucumber'],
    farmSize: '2.4 hectares',
    onPlatformSince: 'Dec 2025',
    revenue: 1850000,
    sellThrough: 82,
    medianTimeToSale: 4,
    inventoryTurnover: 1.6,
    cropConcentration: 46,
    cancellations: 2,
    activeListings: 9,
    committedValue: 96500,
    feapComponents: [
      { name: 'Transaction consistency', score: 81, evidence: '31 of 34 weeks with at least one completed order', barWidth: 81, barColor: '#2D4739' },
      { name: 'Sales performance', score: 76, evidence: `${NAIRA}1.85M total volume · ${NAIRA}14,600 average order`, barWidth: 76, barColor: '#2D4739' },
      { name: 'Fulfillment', score: 94, evidence: '127 completed of 135 accepted orders', barWidth: 94, barColor: '#2D4739' },
      { name: 'Customer trust', score: '·', evidence: 'CUSTOMER_REPUTATION not shared by farmer. Shown as a gap, not a zero.', barWidth: 100, barColor: 'repeating-linear-gradient(90deg,#D9D0C3 0 4px,transparent 4px 8px)' },
      { name: 'Produce quality', score: 82, evidence: 'Average freshness estimate 82 across 64 Fresco scans', barWidth: 82, barColor: '#2D4739' },
    ],
    consentScopes: [
      { name: 'TRANSACTION_HISTORY', state: 'Shared', stateStyle: { color: '#2A6B45' } },
      { name: 'REVENUE_HISTORY', state: 'Shared', stateStyle: { color: '#2A6B45' } },
      { name: 'FULFILLMENT_HISTORY', state: 'Shared', stateStyle: { color: '#2A6B45' } },
      { name: 'QUALITY_HISTORY', state: 'Shared', stateStyle: { color: '#2A6B45' } },
      { name: 'CUSTOMER_REPUTATION', state: 'Not shared', stateStyle: { color: '#C17D0A', fontWeight: 500 } },
      { name: 'FEAP', state: 'Shared', stateStyle: { color: '#2A6B45' } },
      { name: 'PROFILE_MATURITY', state: 'Shared', stateStyle: { color: '#2A6B45' } },
    ],
    inventoryItems: [
      { label: 'Active listings', value: '9', basis: `${NAIRA}412,000 total ask, currently LISTED`, cohort: '' },
      { label: 'Committed to in-flight orders', value: `${NAIRA}96.5K`, basis: '4 orders ACCEPTED, not yet delivered', cohort: '' },
      { label: 'Sell-through', value: '82%', basis: '112 of 137 listings sold before expiry', cohort: 'Portfolio median 74%' },
      { label: 'Median time to sale', value: '4 days', basis: 'LISTED → first order, across 137 listings', cohort: 'Portfolio median 6 days' },
      { label: 'Inventory turnover', value: '1.6×', basis: `Value sold ${NAIRA}1.42M ÷ average listed ${NAIRA}888K, monthly`, cohort: '' },
      { label: 'Spoilage rate', value: '11%', basis: '15 of 137 listings reached EXPIRED unsold', cohort: 'Portfolio median 14%' },
      { label: 'Crop concentration', value: '46%', basis: `${NAIRA}654,000 of ${NAIRA}1.42M revenue in tomato alone`, cohort: 'Single-season exposure' },
      { label: 'Cancellations', value: '2 of 135', basis: '1 farmer-initiated · 1 buyer-initiated', cohort: '' },
    ],
  },
  {
    id: 'FR-FRM-00289',
    name: 'Ibrahim Sule',
    farm: 'Sule Produce · Epe, Lagos',
    location: 'Epe, Lagos',
    feap: 74,
    feapHistory: [58, 64, 70, 74],
    band: 'Established',
    activity: `${NAIRA}1.21M · 88 orders`,
    fulfil: '91%',
    spoilage: '9%',
    screening: 'Meets criteria',
    consent: 'All 7 scopes',
    consentStyle: 'full',
    volume: 1210000,
    completedOrders: 88,
    acceptedOrders: 97,
    fulfillmentRate: 91,
    activeMonths: 7,
    qualityScore: 78,
    qualityScans: 52,
    crops: ['Tomatoes', 'Pepper'],
    farmSize: '1.8 hectares',
    onPlatformSince: 'Jan 2026',
    revenue: 1210000,
    sellThrough: 91,
    medianTimeToSale: 3,
    inventoryTurnover: 2.4,
    cropConcentration: 38,
    cancellations: 1,
    activeListings: 6,
    committedValue: 42000,
    feapComponents: [],
    consentScopes: [],
    inventoryItems: [],
  },
  {
    id: 'FR-FRM-00156',
    name: 'Grace Adeyemi',
    farm: 'Adeyemi Farms · Agbowa, Lagos',
    location: 'Agbowa, Lagos',
    feap: 68,
    feapHistory: [52, 59, 64, 68],
    band: 'Developing',
    activity: `${NAIRA}940K · 71 orders`,
    fulfil: '88%',
    spoilage: '13%',
    screening: 'Meets criteria',
    consent: '6 of 7 · reputation withheld',
    consentStyle: 'partial',
    volume: 940000,
    completedOrders: 71,
    acceptedOrders: 81,
    fulfillmentRate: 88,
    activeMonths: 6,
    qualityScore: 75,
    qualityScans: 48,
    crops: ['Tomatoes', 'Pepper', 'Cucumber'],
    farmSize: '1.2 hectares',
    onPlatformSince: 'Feb 2026',
    revenue: 940000,
    sellThrough: 88,
    medianTimeToSale: 5,
    inventoryTurnover: 1.8,
    cropConcentration: 42,
    cancellations: 3,
    activeListings: 4,
    committedValue: 28000,
    feapComponents: [],
    consentScopes: [],
    inventoryItems: [],
  },
  {
    id: 'FR-FRM-00385',
    name: 'Tunde Balogun',
    farm: 'Balogun Gardens · Ikorodu, Lagos',
    location: 'Ikorodu, Lagos',
    feap: 61,
    feapHistory: [45, 52, 57, 61],
    band: 'Developing',
    activity: `${NAIRA}610K · 52 orders`,
    fulfil: '84%',
    spoilage: '26%',
    screening: 'Approaching',
    consent: 'All 7 scopes',
    consentStyle: 'full',
    volume: 610000,
    completedOrders: 52,
    acceptedOrders: 62,
    fulfillmentRate: 84,
    activeMonths: 5,
    qualityScore: 68,
    qualityScans: 35,
    crops: ['Maize', 'Cassava'],
    farmSize: '3.1 hectares',
    onPlatformSince: 'Mar 2026',
    revenue: 610000,
    sellThrough: 84,
    medianTimeToSale: 7,
    inventoryTurnover: 1.2,
    cropConcentration: 55,
    cancellations: 4,
    activeListings: 3,
    committedValue: 15000,
    feapComponents: [],
    consentScopes: [],
    inventoryItems: [],
  },
  {
    id: 'FR-FRM-00472',
    name: 'Halima Yusuf',
    farm: 'Yusuf Greens · Ibeju, Lagos',
    location: 'Ibeju, Lagos',
    feap: 57,
    feapHistory: [38, 45, 52, 57],
    band: 'Building',
    activity: `${NAIRA}480K · 44 orders`,
    fulfil: '86%',
    spoilage: '17%',
    screening: 'Approaching',
    consent: 'All 7 scopes',
    consentStyle: 'full',
    volume: 480000,
    completedOrders: 44,
    acceptedOrders: 51,
    fulfillmentRate: 86,
    activeMonths: 4,
    qualityScore: 71,
    qualityScans: 28,
    crops: ['Pepper', 'Okra'],
    farmSize: '1.5 hectares',
    onPlatformSince: 'Apr 2026',
    revenue: 480000,
    sellThrough: 86,
    medianTimeToSale: 6,
    inventoryTurnover: 1.4,
    cropConcentration: 48,
    cancellations: 2,
    activeListings: 2,
    committedValue: 8500,
    feapComponents: [],
    consentScopes: [],
    inventoryItems: [],
  },
  {
    id: 'FR-FRM-00198',
    name: 'Blessing Eze',
    farm: 'Eze Greens · Awka, Anambra',
    location: 'Awka, Anambra',
    feap: 55,
    feapHistory: [32, 41, 48, 55],
    band: 'Building',
    activity: `${NAIRA}390K · 19 orders`,
    fulfil: '92%',
    spoilage: '8%',
    screening: 'Approaching',
    consent: '6 of 7 · reputation withheld',
    consentStyle: 'partial',
    volume: 390000,
    completedOrders: 19,
    acceptedOrders: 21,
    fulfillmentRate: 92,
    activeMonths: 3,
    qualityScore: 79,
    qualityScans: 22,
    crops: ['Tomatoes', 'Cucumber'],
    farmSize: '0.8 hectares',
    onPlatformSince: 'May 2026',
    revenue: 390000,
    sellThrough: 90,
    medianTimeToSale: 3,
    inventoryTurnover: 2.1,
    cropConcentration: 62,
    cancellations: 0,
    activeListings: 1,
    committedValue: 0,
    feapComponents: [],
    consentScopes: [],
    inventoryItems: [],
  },
  {
    id: 'FR-FRM-00234',
    name: 'Yusuf Bello',
    farm: 'Bello Roots · Bida, Niger',
    location: 'Bida, Niger',
    feap: 63,
    feapHistory: [41, 50, 57, 63],
    band: 'Developing',
    activity: `${NAIRA}720K · 28 orders`,
    fulfil: '88%',
    spoilage: '12%',
    screening: 'Meets criteria',
    consent: 'All 7 scopes',
    consentStyle: 'full',
    volume: 720000,
    completedOrders: 28,
    acceptedOrders: 32,
    fulfillmentRate: 88,
    activeMonths: 4,
    qualityScore: 74,
    qualityScans: 31,
    crops: ['Maize', 'Yam'],
    farmSize: '2.0 hectares',
    onPlatformSince: 'Mar 2026',
    revenue: 720000,
    sellThrough: 88,
    medianTimeToSale: 5,
    inventoryTurnover: 1.5,
    cropConcentration: 44,
    cancellations: 1,
    activeListings: 2,
    committedValue: 12000,
    feapComponents: [],
    consentScopes: [],
    inventoryItems: [],
  },
  {
    id: 'FR-FRM-00501',
    name: 'Grace Mbah',
    farm: 'Mbah Homestead · Ogoja, Cross River',
    location: 'Ogoja, Cross River',
    feap: 41,
    feapHistory: [22, 29, 35, 41],
    band: 'Emerging',
    activity: `${NAIRA}120K · 6 orders`,
    fulfil: '83%',
    spoilage: '19%',
    screening: 'Insufficient',
    consent: 'All 7 scopes',
    consentStyle: 'full',
    volume: 120000,
    completedOrders: 6,
    acceptedOrders: 8,
    fulfillmentRate: 83,
    activeMonths: 2,
    qualityScore: 65,
    qualityScans: 12,
    crops: ['Cassava', 'Yam'],
    farmSize: '1.0 hectares',
    onPlatformSince: 'Jun 2026',
    revenue: 120000,
    sellThrough: 75,
    medianTimeToSale: 8,
    inventoryTurnover: 0.8,
    cropConcentration: 70,
    cancellations: 2,
    activeListings: 1,
    committedValue: 0,
    feapComponents: [],
    consentScopes: [],
    inventoryItems: [],
  },
]

export const ATTENTION_ITEMS: AttentionItem[] = [
  { name: 'Blessing Eze', feap: '55', reason: 'One order short of the 20-order threshold; all other signals cleared. Decision likely today.' },
  { name: 'Tunde Balogun', feap: '61', reason: 'Spoilage crossed 25% and has risen three months running · working-capital signal to inspect.' },
  { name: 'Amaka Okafor', feap: '79', reason: 'All eight thresholds cleared; under review for 3 days with K. Adebayo. Ready for a decision.' },
]

export const NOTIFICATIONS: NotificationItem[] = [
  { text: 'Blessing Eze granted full consent · profile now visible and screened.', when: '09:24 · TODAY', dot: 'flex:0 0 8px;width:8px;height:8px;border-radius:50%;background:#2A6B45;margin-top:4px' },
  { text: 'Snapshot EV-00143 sealed for Amaka Okafor. Read-only from this point.', when: '14:22 · 19 AUG', dot: 'flex:0 0 8px;width:8px;height:8px;border-radius:50%;background:#2D4739;margin-top:4px' },
  { text: 'Tunde Balogun: spoilage crossed 25% · surfaced in UNDER_REVIEW with reason.', when: '11:37 · 18 AUG', dot: 'flex:0 0 8px;width:8px;height:8px;border-radius:50%;background:#B3541E;margin-top:4px' },
]

export const PROFILE_KPIS: ProfileKpiItem[] = [
  { label: 'REVENUE OBSERVED', value: `${NAIRA}1.85M`, basis: '8 active months' },
  { label: 'TRANSACTIONS', value: '127', basis: `${NAIRA}14,600 average order` },
  { label: 'FULFILLMENT', value: '94%', basis: '127 of 135 accepted' },
  { label: 'REPEAT CUSTOMERS', value: '72%', basis: '41 of 57 buyers returned' },
]

export const MEDIANS: MedianItem[] = [
  { label: 'MEDIAN FEAP', value: '63', note: 'across 116 consented farmers' },
  { label: 'MEDIAN FULFILMENT', value: '87%', note: 'delivered inside agreed window' },
  { label: 'MEDIAN SELL-THROUGH', value: '74%', note: 'listings sold before expiry' },
  { label: 'MEDIAN SPOILAGE', value: '14%', note: 'listings EXPIRED unsold' },
]

export const CROPS: CropItem[] = [
  { name: 'Tomato', value: `${NAIRA}6.6M`, barWidth: 31, barColor: '#B3541E' },
  { name: 'Pepper', value: `${NAIRA}4.5M`, barWidth: 21, barColor: '#2D4739' },
  { name: 'Maize', value: `${NAIRA}3.6M`, barWidth: 17, barColor: '#2D4739' },
  { name: 'Cassava', value: `${NAIRA}2.8M`, barWidth: 13, barColor: '#4A8C3F' },
  { name: 'Yam', value: `${NAIRA}2.4M`, barWidth: 11, barColor: '#4A8C3F' },
  { name: 'Okra', value: `${NAIRA}1.5M`, barWidth: 7, barColor: '#8C8C7A' },
]

export const STATES: StateItem[] = [
  { name: 'Lagos', farmers: '42', volume: `${NAIRA}8.1M`, feap: '68', spoilage: '12%', review: '6 profiles' },
  { name: 'Enugu', farmers: '21', volume: `${NAIRA}3.9M`, feap: '61', spoilage: '15%', review: '4 profiles' },
  { name: 'Oyo', farmers: '17', volume: `${NAIRA}3.0M`, feap: '59', spoilage: '18%', review: '3 profiles' },
  { name: 'Katsina', farmers: '14', volume: `${NAIRA}2.6M`, feap: '64', spoilage: '11%', review: '2 profiles' },
  { name: 'Niger', farmers: '12', volume: `${NAIRA}2.1M`, feap: '57', spoilage: '16%', review: '1 profile' },
  { name: 'Cross River', farmers: '10', volume: `${NAIRA}1.7M`, feap: '52', spoilage: '21%', review: '·' },
]

export const ACTIVE_COLUMNS: PipelineColumn[] = [
  {
    code: 'SUBMITTED',
    note: 'awaiting first look',
    count: '9',
    cards: [
      { name: 'Blessing Eze', feap: '55', reason: 'One order short of the 20-order threshold; all other signals cleared.', meta: '2 DAYS IN STATE' },
      { name: 'Yusuf Bello', feap: '63', reason: 'Fulfilment recovered to 88% after two missed windows in June.', meta: '1 DAY IN STATE' },
      { name: 'Halima Yusuf', feap: '57', reason: 'Spoilage improved to 17% after two months above 20%.', meta: '4 DAYS IN STATE' },
    ],
  },
  {
    code: 'UNDER_REVIEW',
    note: 'analyst assigned',
    count: '7',
    cards: [
      { name: 'Amaka Okafor', feap: '79', reason: 'All eight thresholds cleared; spoilage 11% against portfolio median 14%.', meta: 'K. ADEBAYO · 3 DAYS' },
      { name: 'Ibrahim Sule', feap: '74', reason: 'Highest turnover in queue: 2.4× monthly, sell-through 91%.', meta: 'K. ADEBAYO · 1 DAY' },
      { name: 'Tunde Balogun', feap: '61', reason: 'Spoilage 26% and rising for three months · working-capital signal to inspect.', meta: 'N. OYELARAN · 2 DAYS' },
    ],
  },
]

export const TERMINAL: TerminalItem[] = [
  { code: 'REFERRED_TO_WEMA', count: '5', rows: [{ name: 'Grace Adeyemi', ref: 'EV-00092 · 14 AUG' }, { name: 'Ibrahim Sule', ref: 'EV-00074 · 09 AUG' }] },
  { code: 'MORE_ACTIVITY_NEEDED', count: '2', rows: [{ name: 'Grace Mbah', ref: 'EV-00061 · 04 AUG' }] },
  { code: 'NOT_REFERRED', count: '1', rows: [{ name: 'Tunde Balogun', ref: 'EV-00081 · 11 AUG' }] },
]

export const DECISION_STATES: DecisionState[] = [
  { code: 'REFERRED_TO_WEMA', note: 'Potentially eligible for bank review. The evidence pack and its frozen snapshot pass to Wema.' },
  { code: 'NOT_REFERRED', note: 'Not referred at this time. A reason is required and is returned to the farmer in the passport.' },
  { code: 'MORE_ACTIVITY_NEEDED', note: 'The constructive path. Names the specific gaps and the figures that would close them.' },
  { code: 'WITHDRAWN', note: 'Farmer withdrew, or consent was revoked mid-review. Existing records become read-only.' },
]

export const SNAPSHOT: SnapshotItem[] = [
  { k: 'Snapshot', v: 'EV-00143' },
  { k: 'Farmer', v: 'FR-FRM-00417' },
  { k: 'FEAP at decision', v: '79' },
  { k: 'Score version', v: 'FEAP-v1.0' },
  { k: 'Metrics frozen', v: '24 values' },
  { k: 'Consent scopes active', v: '6 of 7' },
  { k: 'Evidence as of', v: '18 Aug 2026' },
  { k: 'Recorded by', v: 'K. Adebayo' },
]

export const PACKS: PackItem[] = [
  { id: 'EV-00143', farmer: 'Amaka Okafor', scopes: '6 of 7 scopes active', decision: 'UNDER_REVIEW', feap: '79', version: 'FEAP-v1.0', recorded: '19 Aug 2026' },
  { id: 'EV-00092', farmer: 'Grace Adeyemi', scopes: '6 of 7 scopes active', decision: 'REFERRED_TO_WEMA', feap: '68', version: 'FEAP-v1.0', recorded: '14 Aug 2026' },
  { id: 'EV-00081', farmer: 'Tunde Balogun', scopes: '7 of 7 scopes active', decision: 'NOT_REFERRED', feap: '61', version: 'FEAP-v1.0', recorded: '11 Aug 2026' },
  { id: 'EV-00074', farmer: 'Ibrahim Sule', scopes: '7 of 7 scopes active', decision: 'REFERRED_TO_WEMA', feap: '74', version: 'FEAP-v1.0', recorded: '09 Aug 2026' },
  { id: 'EV-00061', farmer: 'Grace Mbah', scopes: '7 of 7 scopes active', decision: 'MORE_ACTIVITY_NEEDED', feap: '41', version: 'FEAP-v0.9', recorded: '04 Aug 2026' },
  { id: 'EV-00043', farmer: 'Halima Yusuf', scopes: '5 of 7 · consent withdrawn', decision: 'WITHDRAWN', feap: '57', version: 'FEAP-v0.9', recorded: '28 Jul 2026' },
]

export const AUDIT: AuditItem[] = [
  { when: '19 AUG 14:22', what: 'K. Adebayo opened FR-FRM-00417 and froze snapshot EV-00143.' },
  { when: '18 AUG 03:00', what: 'SYSTEM · nightly evidence refresh completed. 116 profiles recomputed at FEAP-v1.0.' },
  { when: '17 AUG 22:11', what: 'SYSTEM · listing FR-LST-08841 reached EXPIRED unsold; spoilage recomputed for FR-FRM-00385.' },
  { when: '16 AUG 10:04', what: 'MORE_ACTIVITY_NEEDED reason returned to Grace Mbah with the two named gaps.' },
  { when: '14 AUG 16:41', what: 'Grace Adeyemi referred to Wema. Snapshot EV-00092 sealed and made read-only.' },
  { when: '28 JUL 09:12', what: 'Halima Yusuf withdrew consent. Live profile removed from all Wema surfaces; decision record retained and flagged.' },
]

export const SCHEDULED: ScheduledReport[] = [
  { name: 'Portfolio activity summary', detail: 'Counts, volume, maturity bands, consent coverage', cadence: 'MONTHLY' },
  { name: 'Spoilage and working capital', detail: 'Spoilage distribution, sell-through, turnover by state', cadence: 'MONTHLY' },
  { name: 'Decision log', detail: 'Every referral state change with its stated reason', cadence: 'WEEKLY' },
  { name: 'Consent register', detail: 'Grants, partial scopes and revocations', cadence: 'WEEKLY' },
]

export const THRESHOLDS: ThresholdItem[] = [
  { signal: 'Business tenure', value: '≥ 3 active months', source: 'activeMonths', clearing: '97 of 116' },
  { signal: 'Transaction volume', value: '≥ 20 completed orders', source: 'completedOrders', clearing: '84 of 116' },
  { signal: 'Fulfilment reliability', value: '≥ 85%', source: 'fulfillmentRate', clearing: '95 of 116' },
  { signal: 'Revenue continuity', value: '≥ 3 of last 4 months', source: 'order history', clearing: '88 of 116' },
  { signal: 'Quality evidence', value: '≥ 10 Fresco scans', source: 'ProduceScan', clearing: '71 of 116' },
  { signal: 'Customer base', value: '≥ 5 distinct buyers', source: 'customerCount', clearing: '93 of 116' },
  { signal: 'Consent coverage', value: 'All product scopes', source: 'Consent.scopes', clearing: '104 of 116' },
  { signal: 'Disputes', value: 'None unresolved', source: 'dispute records', clearing: '113 of 116' },
]

export const POLICIES: PolicyItem[] = [
  { name: 'No consent, no record', detail: 'Unconsented farmers are absent from search, counts and distribution. Never greyed out.', state: 'ENFORCED' },
  { name: 'Partial consent shown as partial', detail: 'A withheld scope renders as "Not shared by farmer", never as a blank or a zero.', state: 'ENFORCED' },
  { name: 'Revocation mid-review', detail: 'Removes the live profile immediately. Decision records and snapshots are retained, read-only, flagged consent withdrawn.', state: 'ENFORCED' },
  { name: 'Automated referral', detail: 'No profile is referred without an analyst recording the decision. No auto-refer above any score.', state: 'DISABLED' },
]

export const TEAM: TeamMember[] = [
  { name: 'K. Adebayo', role: 'Agri Credit · analyst' },
  { name: 'N. Oyelaran', role: 'Agri Credit · analyst' },
  { name: 'F. Abubakar', role: 'Credit risk · reviewer' },
  { name: 'S. Ilori', role: 'Compliance · read only' },
]

export const FILTERS = ['Activity band', 'State', 'Crop', 'Consent scope', 'Tenure', 'Screening result', 'Spoilage above median']

export const OUTCOMES = [
  { code: 'REFERRED_TO_WEMA', note: 'Potentially eligible for bank review. Pack and frozen snapshot pass to Wema.' },
  { code: 'MORE_ACTIVITY_NEEDED', note: 'Constructive path. Named gaps return to the farmer with the figures.' },
  { code: 'NOT_REFERRED', note: 'Not referred at this time. Reason required and returned to the farmer.' },
]