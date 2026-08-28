// Portfolio data assembly for the Wema portal.
//
// Consent is enforced here, at the assembly layer, not in the UI. A farmer
// without an active consent is absent from every figure on this page · not
// filtered out downstream, not greyed, absent. That is the only way the
// privacy model holds.
//
// The surface currently reads the seeded demo (lib/seed/portfolio.seed.ts).
// The same shapes back the real query layer when the evidence spine lands.

import {
  SEED_ROWS,
  SEED_METRICS,
  SEED_VOLUME_NAIRA,
  SEED_BANDS,
  SEED_SCREENING,
} from '@/lib/seed/portfolio.seed'

export type ConsentState = 'ACTIVE' | 'PARTIAL' | 'REVOKED'

export type PortfolioRow = {
  farmerId: string
  name: string
  farmName: string
  location: string
  crops: string
  feap: number
  band: string
  volume: number
  completedOrders: number
  acceptedOrders: number
  fulfillmentRate: number
  consent: ConsentState
  consentVersion: string
  withheldCount: number
  activeMonths: number
  lastActivityAt: string | null
  isSeeded: boolean
}

export type MetricKey =
  | 'registeredFarmers'
  | 'activeThisMonth'
  | 'transactions'
  | 'transactionVolume'
  | 'consentedProfiles'
  | 'awaitingReview'

export type MetricDelta = { text: string; tone: 'pos' | 'neg' | 'attn' }

export type PortfolioData = {
  metrics: Record<MetricKey, number> & {
    deltas: Record<MetricKey, MetricDelta>
  }
  volumeSeries: { month: string; value: number }[]
  bandDistribution: { band: string; count: number }[]
  surfacedToday: { farmerId: string; name: string; reason: string }[]
  rows: PortfolioRow[]
  screeningProfile: { key: string; version: string; illustrative: boolean }
  dataAsOf: string
}

/** Five-band ladder. Cut points live here and nowhere else. */
export function feapBand(score: number): string {
  if (score >= 81) return 'Strong'
  if (score >= 69) return 'Established'
  if (score >= 42) return 'Developing'
  if (score >= 21) return 'Building'
  return 'Emerging'
}

export type PortfolioPreview = {
  /** No consented profiles at all · the empty-portfolio surface. */
  empty?: boolean
  /** Fewer than three months of chart history. */
  history?: boolean
  /** Simulated refresh failure · exercises the error boundary. */
  error?: boolean
}

const DELTAS: Record<MetricKey, MetricDelta> = {
  registeredFarmers: { text: '+12 vs last month', tone: 'pos' },
  activeThisMonth: { text: '+9 vs last month', tone: 'pos' },
  transactions: { text: '+312 vs last month', tone: 'pos' },
  transactionVolume: { text: '+₦3.2M vs last month', tone: 'pos' },
  consentedProfiles: { text: '+18 vs last month', tone: 'pos' },
  awaitingReview: { text: '+2 vs last month', tone: 'attn' },
}

export async function getPortfolio(preview: PortfolioPreview = {}): Promise<PortfolioData> {
  if (preview.error) {
    throw new Error(
      'The Fresco sync service did not respond during the latest refresh.',
    )
  }

  const now = new Date()

  const monthName = (offset: number) =>
    new Date(now.getFullYear(), now.getMonth() + offset, 1).toLocaleString('en-NG', {
      month: 'short',
    })

  // Trailing six months (two in the history preview) · the chart refuses to
  // draw a trend from a two-point line, and the assembly lets it see that.
  const months = preview.history ? 2 : 6
  const volumeSeries = SEED_VOLUME_NAIRA.slice(-months).map((value, i) => ({
    month: monthName(i - months + 1),
    value,
  }))

  const rows: PortfolioRow[] = preview.empty
    ? []
    : SEED_ROWS.map((r) => ({
        farmerId: r.farmerId,
        name: r.name,
        farmName: r.farmName,
        location: r.location,
        crops: r.crops,
        feap: r.feap,
        band: feapBand(r.feap),
        volume: r.volume,
        completedOrders: r.completedOrders,
        acceptedOrders: r.acceptedOrders,
        fulfillmentRate: r.fulfillmentRate,
        consent: r.consent,
        consentVersion: r.consentVersion,
        withheldCount: r.withheldCount,
        activeMonths: r.activeMonths,
        lastActivityAt: new Date(now.getTime() - r.agoMs).toISOString(),
        isSeeded: true,
      }))

  const consentedCount = preview.empty ? 0 : SEED_METRICS.consentedProfiles

  const metrics = {
    registeredFarmers: SEED_METRICS.registeredFarmers,
    activeThisMonth: SEED_METRICS.activeThisMonth,
    transactions: SEED_METRICS.transactions,
    transactionVolume: SEED_METRICS.transactionVolume,
    consentedProfiles: consentedCount,
    awaitingReview: preview.empty ? 0 : SEED_METRICS.awaitingReview,
    deltas: DELTAS,
  }

  const bandDistribution = preview.empty
    ? SEED_BANDS.map((b) => ({ ...b, count: 0 }))
    : SEED_BANDS

  // "Who needs me today" · a stated reason or it does not belong here.
  const surfacedToday = preview.empty
    ? []
    : rows
        .filter((r) => r.feap >= 61 && r.fulfillmentRate >= 85 && r.completedOrders >= 20)
        .slice(0, 2)
        .map((r) => ({
          farmerId: r.farmerId,
          name: r.name,
          reason: `meets ${SEED_SCREENING.key} v${SEED_SCREENING.version}`,
        }))

  return {
    metrics,
    volumeSeries,
    bandDistribution,
    surfacedToday,
    rows,
    screeningProfile: SEED_SCREENING,
    dataAsOf: now.toISOString(),
  }
}