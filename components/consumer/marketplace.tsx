'use client'

import { useEffect, useMemo, useState } from 'react'
import { MapPin, Search, ShoppingCart, X } from 'lucide-react'
import { api, naira } from '@/lib/client-api'
import { addToCart as persistAdd, clearCart, readCart, removeFromCart as persistRemove, setCartQty as persistQty } from '@/lib/cart'

type Listing = {
  id: string
  name: string
  category: string
  price: number
  quantity: number
  unit: string
  imageUrl?: string | null
  distanceKm?: number | null
  farmName?: string
  location?: string
  verified?: boolean
  frescoScan?: { freshnessScore: number; estimatedShelfLifeDays: number; qualityLabel?: string } | null
}

type CartItem = { listing: Listing; qty: number }

export function Marketplace() {
  const [listings, setListings] = useState<Listing[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [paymentRef, setPaymentRef] = useState('')
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')

  useEffect(() => {
    api<Listing[]>('/api/produce').then((data) => {
      setListings(data)
      setCart(readCart()
        .map((entry: { listingId: string; qty: number }) => {
          const listing = data.find((l) => l.id === entry.listingId)
          return listing ? { listing, qty: entry.qty } : null
        })
        .filter((item: CartItem | null): item is CartItem => item !== null))
    }).catch((e) => setError(e.message))
  }, [])

  const visible = useMemo(() => {
    return listings.filter((l) => {
      const matchesSearch = !search || l.name.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = !category || category === 'All' || l.category === category
      return matchesSearch && matchesCategory
    })
  }, [listings, search, category])

  const categories = useMemo(() => ['All', ...Array.from(new Set(listings.map((l) => l.category)))], [listings])
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0)
  const cartTotal = cart.reduce((sum, item) => sum + item.qty * item.listing.price, 0)

  const addToCart = (listing: Listing) => {
    setCart((prev) => {
      const next = [...prev]
      const existing = next.find((item) => item.listing.id === listing.id)
      if (existing) existing.qty += 1
      else next.push({ listing, qty: 1 })
      persistAdd(listing.id, 1)
      return next
    })
  }

  const changeQty = (id: string, delta: number) => {
    setCart((prev) => {
      const next = prev
        .map((item) => (item.listing.id === id ? { ...item, qty: item.qty + delta } : item))
        .filter((item) => item.qty > 0)
      if (delta < 0) persistRemove(id)
      else persistQty(id, Math.max(1, (prev.find((item) => item.listing.id === id)?.qty ?? 0) + delta))
      return next
    })
  }

  const placeOrder = async () => {
    setPaying(true)
    setError('')
    try {
      const order = await api<{ id: string; reference: string; total: number }>('/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          items: cart.map((item) => ({ produceId: item.listing.id, quantity: item.qty })),
        }),
      })
      const payment = await api<{ reference: string; redirectUrl?: string; provider: string }>('/api/payments', {
        method: 'POST',
        body: JSON.stringify({ orderId: order.id }),
      })
      const verification = await api<{ paymentStatus: string; orderStatus: string }>('/api/payments/verify', {
        method: 'POST',
        body: JSON.stringify({ reference: payment.reference }),
      })
      setPaymentRef(verification.paymentStatus)
      clearCart()
      setCart([])
      setCartOpen(false)
      setCheckoutOpen(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Order failed')
    } finally {
      setPaying(false)
    }
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Marketplace</p>
          <h1>Fresh produce, verified</h1>
          <p className="subheading">Fresco-verified produce from nearby farms. Pay securely and track fulfilment.</p>
        </div>
        <button className="cart-button" onClick={() => setCartOpen(true)}>
          <ShoppingCart size={18} /> Cart <b>{cartCount}</b>
        </button>
      </div>

      {error && <p className="status-pill orange" style={{ marginBottom: 16 }}>{error}</p>}
      {paymentRef && <p className="status-pill green" style={{ marginBottom: 16 }}>Payment {paymentRef} · order confirmed. Track it in your orders.</p>}

      <div className="market-toolbar">
        <div className="search-box"><Search size={16} /><input placeholder="Search produce…" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        <div className="category-tabs">
          {categories.map((c) => (
            <button key={c} className={category === c || (c === 'All' && !category) ? 'active' : ''} onClick={() => setCategory(c)}>{c}</button>
          ))}
        </div>
      </div>

      <div className="listing-grid">
        {visible.length === 0 && <p className="subheading">No produce matches your search.</p>}
        {visible.map((listing) => (
          <article className="listing-card" key={listing.id}>
            <div className="produce-photo photo-vegetables"><span>●</span></div>
            <div className="listing-body">
              <div className="listing-top">
                {listing.verified || listing.frescoScan ? (
                  <span className="status-pill green"><span className="status-dot" />Fresco Verified</span>
                ) : (
                  <span className="status-pill neutral"><span className="status-dot" />Not yet scanned</span>
                )}
                <span className="category">{listing.category}</span>
              </div>
              <h3><a href={`/consumer/produce/${listing.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>{listing.name}</a></h3>
              <p className="location"><MapPin size={13} /> {listing.farmName ?? 'Farm'} · {listing.location ?? '·'}{listing.distanceKm != null ? ` · ${listing.distanceKm.toFixed(1)} km` : ''}</p>
              <div className="listing-bottom">
                <div><b>{naira(listing.price)}</b><span> / {listing.unit}</span></div>
                <button className="small-button" onClick={() => addToCart(listing)} disabled={listing.quantity < 1}>Add to cart</button>
              </div>
              {listing.frescoScan && <p className="subheading" style={{ marginTop: 8 }}>Freshness {listing.frescoScan.freshnessScore}% · shelf life ~{listing.frescoScan.estimatedShelfLifeDays} days</p>}
            </div>
          </article>
        ))}
      </div>

      {cartOpen && (
        <div className="modal-backdrop" onClick={() => setCartOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setCartOpen(false)} aria-label="Close"><X size={18} /></button>
            <div className="modal-icon"><ShoppingCart size={22} /></div>
            <p className="eyebrow">Your cart</p>
            <h2>{cartCount} item{cartCount === 1 ? '' : 's'}</h2>
            <div className="order-list">
              {cart.map((item) => (
                <div className="order-row" key={item.listing.id}>
                  <div className="order-icon"><ShoppingCart size={17} /></div>
                  <div className="order-main"><b>{item.listing.name}</b><span>{naira(item.listing.price)}/{item.listing.unit}</span></div>
                  <div className="flex gap-2" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button className="small-button" onClick={() => changeQty(item.listing.id, -1)}>−</button>
                    <b>{item.qty}</b>
                    <button className="small-button" onClick={() => changeQty(item.listing.id, 1)}>+</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="checkout-total"><span>Total (server-confirmed)</span><b>{naira(cartTotal)}</b></div>
            <button className="primary-button full" disabled={cart.length === 0 || paying} onClick={() => { setCartOpen(false); setCheckoutOpen(true) }}>
              {paying ? 'Processing…' : 'Checkout'}
            </button>
          </div>
        </div>
      )}

      {checkoutOpen && (
        <div className="modal-backdrop" onClick={() => setCheckoutOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setCheckoutOpen(false)} aria-label="Close"><X size={18} /></button>
            <div className="modal-icon"><ShoppingCart size={22} /></div>
            <p className="eyebrow">Checkout</p>
            <h2>Pay {naira(cartTotal)}</h2>
            <p className="modal-copy">Instant settlement secured by Fresco Escrow. Funds are protected until verified delivery.</p>
            <div className="checkout-modal"><b>Delivery to</b><span>Ikorodu, Lagos</span><b>Payment method</b><span>Fresco Instant Settlement</span></div>
            <button className="primary-button full" disabled={paying} onClick={placeOrder}>
              {paying ? 'Verifying payment…' : `Pay ${naira(cartTotal)}`}
            </button>
          </div>
        </div>
      )}
    </>
  )
}