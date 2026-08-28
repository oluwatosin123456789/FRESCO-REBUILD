'use client'

import { useEffect, useSyncExternalStore } from 'react'
import { MARKET, type MarketItem } from '@/lib/seed/fresco-baseline'
import { MARKETPLACE_ITEMS } from '@/lib/cart/catalog'
import { api } from '@/lib/client-api'

type ApiListing = {
  id: string
  name: string
  category?: string
  price: number
  quantity: number
  unit: string
  status: string
  batchId?: string | null
  imageUrl?: string | null
  distanceKm?: number | null
  farmName?: string | null
  location?: string | null
  frescoScan?: { freshnessScore: number; estimatedShelfLifeDays: number; qualityLabel?: string } | null
}

export type CartState = Record<string, number>
export type CartLine = { item: MarketItem; qty: number }

const CART_KEY = 'fresco-cart-v2'

function loadCart(): CartState {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(CART_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, unknown>
    const out: CartState = {}
    for (const [id, qty] of Object.entries(parsed)) {
      if (typeof qty === 'number' && qty > 0) out[id] = Math.floor(qty)
    }
    return out
  } catch {
    return {}
  }
}

let catalog: MarketItem[] = [...MARKET, ...MARKETPLACE_ITEMS]
let cart: CartState = typeof window !== 'undefined' ? loadCart() : {}
let catalogRequested = false

const listeners = new Set<() => void>()
function emit() {
  listeners.forEach((l) => l())
}
function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}
function saveCart() {
  try {
    window.localStorage.setItem(CART_KEY, JSON.stringify(cart))
  } catch {
    // storage unavailable · cart lives in memory
  }
}

function ensureCatalog() {
  if (catalogRequested || typeof window === 'undefined') return
  catalogRequested = true
  api<ApiListing[]>('/api/produce')
    .then((data) => {
      if (!Array.isArray(data) || data.length === 0) return
      const mapped: MarketItem[] = data
        .filter((l) => l.status === 'LISTED')
        .map((l) => ({
          id: l.id,
          farm: l.farmName ?? 'Amaka Farms',
          farmer: (l.farmName ?? 'amaka').toLowerCase().replace(/\s+/g, ''),
          loc: l.location ?? 'Ikorodu',
          name: l.name,
          price: l.price,
          unit: l.unit,
          qty: l.quantity,
          image: 'crate',
          batch: l.batchId ?? '·',
          freshness: l.frescoScan?.freshnessScore ?? 0,
          shelfLife: l.frescoScan?.estimatedShelfLifeDays ?? 0,
          grade: l.frescoScan?.qualityLabel ?? 'Standard',
          rating: 4.6,
          buyers: 0,
          distKm: l.distanceKm ?? 2,
        }))
      catalog = [...mapped, ...MARKETPLACE_ITEMS.filter((i) => !mapped.some((m) => m.id === i.id))]
      emit()
    })
    .catch(() => undefined)
}

export function useCatalog(): MarketItem[] {
  useEffect(() => {
    ensureCatalog()
  }, [])
  return useSyncExternalStore(subscribe, () => catalog, () => MARKET)
}

export function useCartState(): CartState {
  return useSyncExternalStore(subscribe, () => cart, () => ({}))
}

export const cartStore = {
  add(id: string) {
    cart = { ...cart, [id]: (cart[id] ?? 0) + 1 }
    saveCart()
    emit()
  },
  setQty(id: string, qty: number) {
    if (qty <= 0) {
      const next = { ...cart }
      delete next[id]
      cart = next
    } else {
      cart = { ...cart, [id]: qty }
    }
    saveCart()
    emit()
  },
  clear() {
    cart = {}
    saveCart()
    emit()
  },
}

export function linesFor(catalog: MarketItem[], cart: CartState): CartLine[] {
  return catalog.filter((c) => (cart[c.id] ?? 0) > 0).map((c) => ({ item: c, qty: cart[c.id] }))
}

export function countFor(cart: CartState): number {
  return Object.values(cart).reduce((s, n) => s + n, 0)
}

export function totalFor(catalog: MarketItem[], cart: CartState): number {
  return linesFor(catalog, cart).reduce((s, l) => s + l.item.price * l.qty, 0)
}
