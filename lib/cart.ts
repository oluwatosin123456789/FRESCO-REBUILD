// Shared consumer cart · localStorage-backed so the marketplace and produce
// detail pages stay in sync. Demo-grade persistence, client-side only.

export type CartItem = { listingId: string; qty: number }

const KEY = 'fresco-cart'

export function readCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as CartItem[]
    return Array.isArray(parsed) ? parsed.filter((item) => item && typeof item.listingId === 'string' && item.qty > 0) : []
  } catch {
    return []
  }
}

export function writeCart(items: CartItem[]) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(KEY, JSON.stringify(items))
  } catch {
    // storage unavailable · cart stays in memory
  }
}

export function addToCart(listingId: string, qty = 1) {
  const items = readCart()
  const existing = items.find((item) => item.listingId === listingId)
  if (existing) existing.qty += qty
  else items.push({ listingId, qty })
  writeCart(items)
  return items
}

export function removeFromCart(listingId: string) {
  const items = readCart().filter((item) => item.listingId !== listingId)
  writeCart(items)
  return items
}

export function setCartQty(listingId: string, qty: number) {
  const items = readCart()
  const existing = items.find((item) => item.listingId === listingId)
  if (existing) existing.qty = Math.max(1, qty)
  writeCart(items)
  return items
}

export function clearCart() {
  writeCart([])
}