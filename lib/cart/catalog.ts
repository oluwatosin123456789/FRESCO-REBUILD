// Shared cart catalogue — unifies the landing marketplace's products with the
// consumer workspace catalogue so a basket built in /marketplace appears in
// /consumer/cart (and vice-versa). One canonical storage key + one key per item.

import { MARKET, type MarketItem } from '@/lib/seed/fresco-baseline'
import { products } from '@/lib/landing/content'

function parseNumber(value: string): number {
  return Number(String(value).replace(/[^0-9.]/g, '')) || 0
}

function shelfDays(value: string): number {
  const match = String(value).match(/(\d+)/)
  return match ? Number(match[1]) : 3
}

function imageForBatch(batch: string): string {
  if (batch.startsWith('TOM')) return 'crate'
  if (batch.startsWith('PEP')) return 'pepper'
  if (batch.startsWith('GRN')) return 'greens'
  if (batch.startsWith('CUC')) return 'cucumber'
  return 'crate'
}

/**
 * The landing marketplace's products expressed as consumer market items. Entries
 * that already exist in the seeded consumer catalogue (same batch) are skipped so
 * nothing renders twice; the rest enrich the consumer browse + cart.
 */
export const MARKETPLACE_ITEMS: MarketItem[] = products
  .filter((product) => !MARKET.some((item) => item.batch === product.batch))
  .map((product) => ({
    id: product.batch,
    farm: 'Fresco Verified',
    farmer: 'fresco',
    loc: 'Ikorodu',
    name: product.name,
    price: parseNumber(product.price),
    unit: product.unit,
    qty: 0,
    image: imageForBatch(product.batch),
    batch: product.batch,
    freshness: product.freshness,
    shelfLife: shelfDays(product.shelfLife),
    grade: product.label,
    rating: 4.8,
    buyers: 0,
    distKm: 2,
  }))

/**
 * Canonical cart key for a produce batch. Seeded market items keep their stable
 * id so both surfaces mutate the same entry; anything else keys by its batch.
 */
export function cartKeyForBatch(batch: string): string {
  const match = MARKET.find((item) => item.batch === batch)
  return match ? match.id : batch
}

/** The shared localStorage key every cart surface persists to. */
export const CART_STORAGE_KEY = 'fresco-cart-v2'