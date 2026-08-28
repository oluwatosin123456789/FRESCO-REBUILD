// Baseline (project-scope) demo data · ported 1:1 from the original Fresco mockup
// (lib/mockup/app.ts) so the redesigned screens keep the same content after that
// file is deleted. Components use these values as fallbacks and prefer live API
// responses whenever they are available (the same pattern as farmer-dashboard.tsx).

export type Produce = {
  id: string
  name: string
  variety: string
  price: number
  unit: string
  qty: number
  image: string
  batch: string
  freshness: number
  shelfLife: number
  confidence: number
  grade: string
  status: string
  listedAt: string
}

export type Scan = {
  id: string
  produce: string
  batch: string
  freshness: number
  shelfLife: number
  confidence: number
  grade: string
  category?: string
  storage: string
  date: string
  used: boolean
  image?: string
}

export type OrderItem = { name: string; qty: string; total: number }

export type Order = {
  id: string
  items: OrderItem[]
  buyer: string
  buyerId: string
  repeat: boolean
  total: number
  status: string
  placed: string
  delivery: string
}

export type ConsentAudit = { at: string; text: string }

export type Consent = {
  status: string
  scopes: Record<string, boolean>
  grantedAt: string
  expiresAt: string
  audit: ConsentAudit[]
}

export type FinanceRequest = {
  id: string
  orderId: string
  label: string
  amount: number
  status: string
  date: string
  note: string
}

export type Metrics = {
  revenue: number
  completed: number
  fulfillment: number
  rating: number
  repeat: number
  months: number
  avgFreshness: number
  recentRevenue: number
}

export type MarketItem = {
  id: string
  farm: string
  farmer: string
  loc: string
  name: string
  price: number
  unit: string
  qty: number
  image: string
  batch: string
  freshness: number
  shelfLife: number
  grade: string
  rating: number
  buyers: number
  distKm: number
}

export const FARMER = {
  name: 'Amaka Okafor',
  farm: 'Amaka Farms',
  location: 'Ikorodu, Lagos',
  initials: 'AO',
}

export const METRICS: Metrics = {
  revenue: 2100000,
  completed: 46,
  fulfillment: 96,
  rating: 4.8,
  repeat: 29,
  months: 14,
  avgFreshness: 91,
  recentRevenue: 1200000,
}

export const PRODUCE: Produce[] = [
  { id: 'p-tom', name: 'Premium Roma Tomatoes', variety: 'Roma', price: 1400, unit: 'kg', qty: 40, image: 'crate', batch: 'TOM-2026-030', freshness: 92, shelfLife: 5, confidence: 0.91, grade: 'Premium', status: 'LISTED', listedAt: '18 Aug 2026' },
  { id: 'p-pep', name: 'Fresh Scotch Bonnet', variety: 'Pepper', price: 1700, unit: 'kg', qty: 25, image: 'pepper', batch: 'PEP-2026-014', freshness: 88, shelfLife: 7, confidence: 0.88, grade: 'Premium', status: 'LISTED', listedAt: '17 Aug 2026' },
  { id: 'p-greens', name: 'Garden Greens', variety: 'Assorted leafy', price: 1000, unit: 'bunch', qty: 60, image: 'greens', batch: 'GRN-2026-021', freshness: 90, shelfLife: 3, confidence: 0.9, grade: 'Standard', status: 'LISTED', listedAt: '16 Aug 2026' },
]

export const SCANS: Scan[] = [
  { id: 's-1', produce: 'Tomatoes · Roma', batch: 'TOM-2026-030', freshness: 92, shelfLife: 5, confidence: 0.91, grade: 'Premium', storage: 'Cool, dry area · out of direct sun', date: '18 Aug 2026', used: true },
  { id: 's-2', produce: 'Peppers · Scotch bonnet', batch: 'PEP-2026-014', freshness: 88, shelfLife: 7, confidence: 0.88, grade: 'Premium', storage: 'Keep ventilated, avoid moisture', date: '17 Aug 2026', used: true },
  { id: 's-3', produce: 'Garden greens', batch: 'GRN-2026-021', freshness: 90, shelfLife: 3, confidence: 0.9, grade: 'Standard', storage: 'Refrigerate, use within 3 days', date: '16 Aug 2026', used: true },
]

export const ORDERS: Order[] = [
  { id: 'HL1024', items: [{ name: 'Tomatoes', qty: '5 kg', total: 8200 }], buyer: 'Chidi E.', buyerId: 'chidi', repeat: true, total: 8200, status: 'PREPARING', placed: '18 Aug · 09:22', delivery: 'Pickup · 20 Aug' },
  { id: 'HL1023', items: [{ name: 'Cucumber', qty: '4 kg', total: 4800 }], buyer: 'Ngozi A.', buyerId: 'ngozi', repeat: false, total: 4800, status: 'READY', placed: '18 Aug · 08:40', delivery: 'Pickup · today' },
  { id: 'HL1021', items: [{ name: 'Peppers', qty: '3 kg', total: 5100 }], buyer: 'David A.', buyerId: 'david', repeat: true, total: 5100, status: 'OUT_FOR_DELIVERY', placed: '17 Aug · 16:12', delivery: 'Delivery · 18 Aug' },
]

export const CONSENT: Consent = {
  status: 'GRANTED',
  scopes: { order: true, revenue: true, quality: true, feap: true, fulfillment: false, reputation: false },
  grantedAt: '18 Aug 2026',
  expiresAt: '18 Feb 2027',
  audit: [
    { at: '18 Aug · 09:22', text: 'Consent granted to Wema Bank · 3 scopes' },
    { at: '18 Aug · 09:22', text: 'Scope added · Quality History' },
    { at: '18 Aug · 09:22', text: 'Scope added · Revenue History' },
    { at: '18 Aug · 09:22', text: 'Scope added · Order History' },
  ],
}

export const FINANCE_REQUESTS: FinanceRequest[] = [
  { id: 'FIN-2026-014', orderId: 'HL1018', label: 'Tomatoes · 10 kg', amount: 12000, status: 'APPROVED', date: '02 Aug 2026', note: 'Inputs for next harvest cycle' },
  { id: 'FIN-2026-011', orderId: 'HL1015', label: 'Greens · 6 bunches', amount: 8000, status: 'DECLINED', date: '21 Jul 2026', note: 'Harvest equipment' },
]

export const MARKET: MarketItem[] = [
  { id: 'm-tom', farm: 'Amaka Farms', farmer: 'amaka', loc: 'Ikorodu', name: 'Premium Roma Tomatoes', price: 1400, unit: 'kg', qty: 40, image: 'crate', batch: 'TOM-2026-030', freshness: 92, shelfLife: 5, grade: 'Premium', rating: 4.8, buyers: 29, distKm: 1.2 },
  { id: 'm-pep', farm: 'Ojo Farms', farmer: 'ojo', loc: 'Ota', name: 'Scotch Bonnet Peppers', price: 1700, unit: 'kg', qty: 25, image: 'pepper', batch: 'PEP-2026-014', freshness: 88, shelfLife: 7, grade: 'Premium', rating: 4.6, buyers: 18, distKm: 4.0 },
  { id: 'm-grn', farm: 'Greenline Farm', farmer: 'greenline', loc: 'Agbowa', name: 'Garden Greens', price: 1000, unit: 'bunch', qty: 60, image: 'greens', batch: 'GRN-2026-021', freshness: 90, shelfLife: 3, grade: 'Standard', rating: 4.5, buyers: 12, distKm: 6.2 },
  { id: 'm-cuc', farm: 'Bamidele Farm', farmer: 'bamidele', loc: 'Ketu', name: 'Fresh Cucumber', price: 800, unit: 'kg', qty: 30, image: 'cucumber', batch: 'CUC-2026-008', freshness: 86, shelfLife: 4, grade: 'Standard', rating: 4.4, buyers: 9, distKm: 8.4 },
]

export const CONSUMER = { name: 'David Ade', location: 'Ikorodu, Lagos', initials: 'DA' }

export const WEMA = { name: 'Wema Analyst', sub: 'Agri-Finance Desk', initials: 'W' }

/* ── helpers (deterministic, ported from app.ts) ─────────────────────── */

export function fmtCompact(n: number): string {
  return '₦' + (n >= 1000000 ? (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M' : n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k' : String(n))
}

export function fmtFull(n: number): string {
  return '₦' + Math.round(n).toLocaleString('en-NG')
}

export function bandOf(feap: number): [string, string] {
  if (feap < 40) return ['Emerging', '#8C8C7A']
  if (feap < 55) return ['Building', '#C17D0A']
  if (feap < 70) return ['Developing', '#4A8C3F']
  if (feap < 85) return ['Established', '#2D4739']
  return ['Strong', '#111410']
}

export type FeapPart = {
  key: string
  label: string
  desc: string
  weight: number
  val: number
  detail: string
}

export function feapCalc(m: Metrics): { score: number; raw: number; parts: FeapPart[] } {
  const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))
  const txn = clamp(m.completed / 60, 0, 1) * 30
  const rev = clamp(m.revenue / 3000000, 0, 1) * 20
  const ful = clamp(m.fulfillment / 100, 0, 1) * 15
  const rep = (m.rating / 5) * clamp(m.repeat / 35, 0, 1) * 15
  const qual = clamp(m.avgFreshness / 100, 0, 1) * 10
  const lon = clamp(m.months / 25, 0, 1) * 10
  const raw = txn + rev + ful + rep + qual + lon
  return {
    score: Math.round(raw),
    raw,
    parts: [
      { key: 'txn', label: 'Transaction consistency', desc: 'weeks with a completed order', weight: 30, val: txn, detail: `${m.completed} verified orders` },
      { key: 'rev', label: 'Revenue consistency', desc: 'consistent monthly revenue', weight: 20, val: rev, detail: fmtFull(m.revenue) + ' lifetime' },
      { key: 'ful', label: 'Fulfillment reliability', desc: 'accepted orders delivered', weight: 15, val: ful, detail: m.fulfillment + '% fulfillment' },
      { key: 'rep', label: 'Customer reputation', desc: 'ratings + repeat buyers', weight: 15, val: rep, detail: m.rating + '/5 · ' + m.repeat + ' repeat buyers' },
      { key: 'qual', label: 'Quality consistency', desc: 'average Fresco freshness', weight: 10, val: qual, detail: m.avgFreshness + '% avg freshness' },
      { key: 'long', label: 'Business longevity', desc: 'active verified months', weight: 10, val: lon, detail: m.months + ' active months' },
    ],
  }
}

export type Opportunity = {
  active: boolean
  amount: number
  matched: { label: string; ok: boolean; detail: string }[]
  feapOk: boolean
}

export function opportunityFor(m: Metrics): Opportunity {
  const rules = [
    { label: '44+ completed orders', ok: m.completed >= 30, detail: `${m.completed} completed orders (≥ 30)` },
    { label: '96%+ fulfillment', ok: m.fulfillment >= 90, detail: `${m.fulfillment}% fulfillment rate (≥ 90%)` },
    { label: '₦1M+ recent revenue', ok: m.recentRevenue >= 1000000, detail: fmtFull(m.recentRevenue) + ' recent revenue (≥ ₦1M)' },
  ]
  const matched = rules.filter((r) => r.ok)
  if (matched.length >= 2) {
    return { active: true, amount: 350000, matched, feapOk: feapCalc(m).score >= 70 }
  }
  return { active: false, amount: 0, matched, feapOk: false }
}
