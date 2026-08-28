import { useSyncExternalStore } from 'react'
import { type Product } from '@/lib/landing/content'
import { cartKeyForBatch, CART_STORAGE_KEY } from '@/lib/cart/catalog'

export type CartState = Record<string, number>

export interface CartLine {
  product: Product
  quantity: number
}

export function parsePrice(price: string): number {
  return Number(price.replace(/[^0-9]/g, ''))
}

export function formatNaira(value: number): string {
  return `N${value.toLocaleString('en-NG')}`
}

export function linesFor(cart: CartState, products: readonly Product[]): CartLine[] {
  return products
    .filter((product) => (cart[cartKeyForBatch(product.batch)] ?? 0) > 0)
    .map((product) => ({ product, quantity: cart[cartKeyForBatch(product.batch)] }))
}

export function cartCount(cart: CartState): number {
  return Object.values(cart).reduce((sum, quantity) => sum + quantity, 0)
}

export function cartTotal(cart: CartState, products: readonly Product[]): number {
  return linesFor(cart, products).reduce((sum, line) => sum + parsePrice(line.product.price) * line.quantity, 0)
}

const CART_EVENT = 'fresco-cart-change'

function loadCart(): CartState {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, unknown>
    const cart: CartState = {}
    for (const [batch, quantity] of Object.entries(parsed)) {
      if (typeof quantity === 'number' && quantity > 0) cart[batch] = Math.floor(quantity)
    }
    return cart
  } catch {
    return {}
  }
}

function saveCart(cart: CartState) {
  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
  } catch {
    // storage unavailable · cart lives in memory for the session
  }
}

let cartCache: CartState | null = null
const EMPTY_CART: CartState = {}
const listeners = new Set<() => void>()

function subscribe(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange)
  return () => {
    listeners.delete(onStoreChange)
  }
}

function getSnapshot(): CartState {
  if (cartCache === null) cartCache = loadCart()
  return cartCache
}

function getServerSnapshot(): CartState {
  return EMPTY_CART
}

function update(updater: (current: CartState) => CartState) {
  const next = updater(cartCache ?? {})
  cartCache = next
  saveCart(next)
  listeners.forEach((listener) => listener())
}

export function useCart() {
  const cart = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  return {
    cart,
    addToCart: (product: Product) => {
      update((current) => ({ ...current, [cartKeyForBatch(product.batch)]: (current[cartKeyForBatch(product.batch)] ?? 0) + 1 }))
    },
    setQuantity: (batch: string, quantity: number) => {
      update((current) => {
        const key = cartKeyForBatch(batch)
        if (quantity <= 0) {
          const next = { ...current }
          delete next[key]
          return next
        }
        return { ...current, [key]: quantity }
      })
    },
  }
}