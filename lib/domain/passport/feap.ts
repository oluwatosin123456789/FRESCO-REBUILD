// FEAP = Farmer Economic Activity Profile (PRD FR-015, Claude §11, Essentials §9)
// Deterministic formula, never an LLM. Not a credit score.

export type FeapMetrics = {
  transactionConsistency: number // 0-100
  revenueConsistency: number // 0-100
  fulfillmentReliability: number // 0-100
  customerReputation: number // 0-100
  qualityConsistency: number // 0-100
  businessLongevity: number // 0-100
}

export const FEAP_WEIGHTS = {
  transactionConsistency: 0.3,
  revenueConsistency: 0.2,
  fulfillmentReliability: 0.15,
  customerReputation: 0.15,
  qualityConsistency: 0.1,
  businessLongevity: 0.1,
} as const

export const FEAP_COMPONENTS = [
  { key: 'transactionConsistency', label: 'Transaction consistency', weight: 0.3 },
  { key: 'revenueConsistency', label: 'Revenue consistency', weight: 0.2 },
  { key: 'fulfillmentReliability', label: 'Fulfillment reliability', weight: 0.15 },
  { key: 'customerReputation', label: 'Customer reputation', weight: 0.15 },
  { key: 'qualityConsistency', label: 'Quality consistency', weight: 0.1 },
  { key: 'businessLongevity', label: 'Business longevity', weight: 0.1 },
] as const

export function normalizeScore(value: number): number {
  if (Number.isNaN(value)) return 0
  return Math.max(0, Math.min(100, value))
}

export function calculateFeap(metrics: FeapMetrics): number {
  const score =
    normalizeScore(metrics.transactionConsistency) * FEAP_WEIGHTS.transactionConsistency +
    normalizeScore(metrics.revenueConsistency) * FEAP_WEIGHTS.revenueConsistency +
    normalizeScore(metrics.fulfillmentReliability) * FEAP_WEIGHTS.fulfillmentReliability +
    normalizeScore(metrics.customerReputation) * FEAP_WEIGHTS.customerReputation +
    normalizeScore(metrics.qualityConsistency) * FEAP_WEIGHTS.qualityConsistency +
    normalizeScore(metrics.businessLongevity) * FEAP_WEIGHTS.businessLongevity
  return Math.round(score)
}

export function feapExplanation(metrics: FeapMetrics, feap: number) {
  const strengths: string[] = []
  const warnings: string[] = []

  if (metrics.transactionConsistency >= 70) strengths.push('Strong transaction consistency')
  else if (metrics.transactionConsistency < 40) warnings.push('Low transaction frequency')
  if (metrics.fulfillmentReliability >= 90) strengths.push('High fulfillment reliability')
  else if (metrics.fulfillmentReliability < 70) warnings.push('Fulfillment rate needs attention')
  if (metrics.customerReputation >= 80) strengths.push('Strong customer reputation')
  if (metrics.qualityConsistency >= 80) strengths.push('Consistent produce quality')
  if (metrics.businessLongevity < 12) warnings.push('Shorter business history')
  else if (metrics.businessLongevity >= 24) strengths.push('Established operating history')

  return {
    score: feap,
    strengths,
    warnings,
    disclaimer:
      'FEAP reflects observed marketplace business activity. It is not a credit score or guarantee of financing.',
  }
}