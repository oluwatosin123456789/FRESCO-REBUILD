// Profile maturity (PRD FR-016, Architecture §12)
// Tiers: 0-39 Emerging, 40-69 Developing, 70-84 Established, 85-100 Highly Established

export type MaturityMetrics = {
  identityCompleteness: number // 0-100
  verifiedTransactions: number // 0-100
  activityDuration: number // 0-100
  fulfillmentHistory: number // 0-100
  customerFeedback: number // 0-100
  produceQualityHistory: number // 0-100
}

const WEIGHTS = {
  identityCompleteness: 0.2,
  verifiedTransactions: 0.25,
  activityDuration: 0.2,
  fulfillmentHistory: 0.15,
  customerFeedback: 0.1,
  produceQualityHistory: 0.1,
} as const

export function clamp(value: number): number {
  return Math.max(0, Math.min(100, value))
}

export function calculateProfileMaturity(metrics: MaturityMetrics): number {
  const score =
    clamp(metrics.identityCompleteness) * WEIGHTS.identityCompleteness +
    clamp(metrics.verifiedTransactions) * WEIGHTS.verifiedTransactions +
    clamp(metrics.activityDuration) * WEIGHTS.activityDuration +
    clamp(metrics.fulfillmentHistory) * WEIGHTS.fulfillmentHistory +
    clamp(metrics.customerFeedback) * WEIGHTS.customerFeedback +
    clamp(metrics.produceQualityHistory) * WEIGHTS.produceQualityHistory
  return Math.round(score)
}

export function maturityTier(maturity: number): string {
  if (maturity >= 85) return 'Highly Established'
  if (maturity >= 70) return 'Established'
  if (maturity >= 40) return 'Developing'
  return 'Emerging'
}

export function maturityLevel(maturity: number): 'high' | 'medium' | 'low' {
  if (maturity >= 70) return 'high'
  if (maturity >= 40) return 'medium'
  return 'low'
}