'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { products } from '@/lib/landing/content'
import { ProductCard } from './product-card'
import { CartDrawer } from './cart-drawer'
import { cartCount, cartTotal, linesFor, useCart } from './cart'

export function MarketplaceClient() {
  const { cart, addToCart, setQuantity } = useCart()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [search, setSearch] = useState('')

  const lines = useMemo(() => linesFor(cart, products), [cart])
  const total = useMemo(() => cartTotal(cart, products), [cart])
  const count = useMemo(() => cartCount(cart), [cart])

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return products
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.batch.toLowerCase().includes(q)
    )
  }, [search])

  const handleAddToCart = (product: (typeof products)[number]) => {
    addToCart(product)
    setDrawerOpen(true)
  }

  return (
    <main className="marketplace-page">
      <header className="marketplace-header">
        <Link className="marketplace-brand" href="/consumer">
          <span className="marketplace-brand-dot" />
          <span>
            fres<span>co</span>
          </span>
        </Link>

        <div className="marketplace-search">
          <span className="marketplace-search-icon">🔍</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search farms, produce, or categories…"
            aria-label="Search produce"
          />
        </div>

        <div className="marketplace-location">
          <span>Location:</span>
          <strong>Ikorodu, Lagos</strong>
        </div>

        <button className="marketplace-cart-link" type="button" onClick={() => setDrawerOpen(true)} aria-label={`Open cart, ${count} items`}>
          <span>🛒</span>
          {count > 0 ? <span className="marketplace-cart-count">{count > 9 ? '9+' : count}</span> : null}
        </button>

        <Link className="marketplace-user" href="/consumer/orders">
          <span className="marketplace-user-avatar">DA</span>
          <span>
            <strong>David Ade</strong>
            <small>Verified buyer</small>
          </span>
        </Link>
      </header>

      <section className="marketplace-hero" aria-labelledby="marketplace-title">
        <p className="eyebrow">Live from the market</p>
        <h1 id="marketplace-title">
          Fresh from the field, <em className="line-italic">verified by Fresco</em>
        </h1>
        <p className="section-lead">
          Every listing carries quality evidence, a freshness score and a traceable batch identifier. Verified smallholder produce · add to cart to start an order.
        </p>
      </section>

      <section className="marketplace-catalog" aria-label="Verified produce for sale">
        {visible.length === 0 ? (
          <p className="section-lead" style={{ textAlign: 'center' }}>
            No produce matches “{search}”.
          </p>
        ) : (
          <div className="marketplace-grid">
            {visible.map((product, index) => (
              <ProductCard key={product.batch} product={product} index={index} onAddToCart={handleAddToCart} />
            ))}
          </div>
        )}
      </section>

      <CartDrawer
        open={drawerOpen}
        lines={lines}
        total={total}
        onUpdateQuantity={setQuantity}
        onRemove={(batch) => setQuantity(batch, 0)}
        onClose={() => setDrawerOpen(false)}
      />
    </main>
  )
}