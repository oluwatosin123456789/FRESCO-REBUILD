import { describe, expect, it } from 'vitest'
import {
  canonical,
  consentScopes,
  methodology,
  passport,
  products,
  stages,
  stories,
  systemEvents,
  trustLayers,
} from './content'

describe('landing content specification', () => {
  it('defines exactly four runway stages in order', () => {
    expect(stages).toHaveLength(4)
    expect(stages.map((stage) => stage.name)).toEqual([
      'THE FIELD',
      'THE SCAN',
      'THE MARKET',
      'THE DELIVERY',
    ])
  })

  it('matches the canonical demo data', () => {
    expect(canonical.verifiedOrders).toBe(46)
    expect(canonical.completedOrders).toBe(44)
    expect(canonical.lifetimeRevenue).toBe('N2.1M+')
    expect(canonical.fulfillmentRate).toBe('96%')
    expect(canonical.averageRating).toBe('4.8/5')
    expect(canonical.feapScore).toBe(78)
    expect(canonical.maturityTier).toBe('Established')
    expect(canonical.sampleBatch).toBe('TOM-2026-030')
    expect(canonical.sampleOrderId).toBe('HVL-ORD-100047')
    expect(canonical.illustrativeOpportunity).toBe('Up to N350,000')
  })

  it('methodology weights sum to 100 and contributions sum to FEAP 78', () => {
    const weights = methodology.reduce((sum, factor) => sum + factor.weight, 0)
    const contributions = methodology.reduce((sum, factor) => sum + factor.contribution, 0)
    expect(weights).toBe(100)
    expect(contributions).toBe(78)
    expect(passport.score).toBe(78)
  })

  it('defines sixteen marketplace products with unique batches', () => {
    expect(products).toHaveLength(16)
    const batches = new Set(products.map((product) => product.batch))
    expect(batches.size).toBe(products.length)
    for (const product of products) {
      expect(product.batch).toMatch(/^[A-Z]{3}-\d{4}-\d{3}$/)
      expect(product.price).toMatch(/^N/)
    }
  })

  it('defines three consent scopes and five trust layers', () => {
    expect(consentScopes).toEqual(['Order History', 'Quality History', 'Revenue History'])
    expect(trustLayers).toHaveLength(5)
  })

  it('defines six stories and five system events', () => {
    expect(stories).toHaveLength(6)
    expect(stories[0].name).toBe('Amaka Okafor')
    expect(stories[3].name).toBe('Ngozi Eze')
    expect(systemEvents).toHaveLength(5)
  })
})