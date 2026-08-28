'use client'

import { Leaf, Package, Star, Timer } from 'lucide-react'
import { Btn, NoteBar } from '@/components/shared/frame-ui'
import { ProductTile } from './product-tile'
import { useCatalog } from './consumer-store'

function HeroMarketScene() {
  return (
    <div className="consumer-hero-art">
      <div className="consumer-hero-art-bg" aria-hidden="true" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/assets/tomato-crate-sun.svg" className="crate" alt="" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/assets/greens-bunch.svg" className="leaf" alt="" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/assets/pepper-basket.svg" className="pepper" alt="Fresh pepper basket" />
      <span className="consumer-hero-chip fresh"><span className="dot" /> Fresco verified · 92% fresh</span>
      <span className="consumer-hero-chip dist"><span className="pin">📍</span> 1.2 km from you</span>
    </div>
  )
}

export function ConsumerHome() {
  const items = useCatalog()

  const stats = [
    { n: String(items.length), l: 'Fresh listings', icon: <Package size={16} strokeWidth={2.2} />, color: '#1888f6' },
    { n: '1.5 hr', l: 'Farm → door', icon: <Timer size={16} strokeWidth={2.2} />, color: '#43b99e' },
    { n: '4.8★', l: 'Farmer rating', icon: <Star size={16} strokeWidth={2.2} />, color: '#ff8a0a' },
    { n: '91%', l: 'Avg freshness', icon: <Leaf size={16} strokeWidth={2.2} />, color: '#49ba51' },
  ]

  return (
    <>
      <div style={{ display: 'flex', gap: 28, alignItems: 'center', marginBottom: 28, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 280 }}>
          <div style={{ font: '600 10.5px var(--mono)', letterSpacing: '.13em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 8 }}>
            Fresco Verified · Grown near you
          </div>
          <h1 style={{ font: '700 clamp(28px,3.2vw,36px)/1.08 var(--serif)', letterSpacing: '-.01em', color: 'var(--ink)', margin: 0 }}>
            Fresh from farms
            <br />
            in <span style={{ color: 'var(--gold)' }}>Ikorodu</span>
          </h1>
          <div style={{ color: 'var(--ink2)', fontSize: 13.5, marginTop: 12, maxWidth: 460, lineHeight: 1.55 }}>
            Every crate below was scanned, scored and listed by the farmer who grew it. Track it from farm to your kitchen.
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 22, flexWrap: 'wrap' }}>
            <Btn tone="dark" href="/consumer/browse">Browse market</Btn>
            <Btn tone="outline" href="/consumer/orders">My orders</Btn>
          </div>
        </div>
        <HeroMarketScene />
      </div>

      <div className="consumer-grid" style={{ marginBottom: 26 }}>
        {stats.map((m) => (
          <div key={m.l} className="consumer-stat" style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 14, padding: 16 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, borderRadius: 10, background: `color-mix(in srgb, ${m.color} 12%, transparent)`, color: m.color, marginBottom: 11 }}>
              {m.icon}
            </span>
            <div style={{ font: '600 24px/1.1 var(--serif)', color: 'var(--ink)' }}>{m.n}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{m.l}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div>
          <div style={{ font: '600 10.5px var(--mono)', letterSpacing: '.13em', textTransform: 'uppercase', color: 'var(--gold)' }}>Today at the market</div>
          <h2 style={{ font: '700 22px var(--serif)', color: 'var(--ink)', margin: '4px 0 0' }}>Fresh picks</h2>
        </div>
        <Btn tone="ghost" href="/consumer/browse">View all</Btn>
      </div>

      <div className="consumer-grid">
        {items.map((item) => (
          <ProductTile key={item.id} item={item} />
        ))}
      </div>

      <div style={{ marginTop: 26 }}>
        <NoteBar>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 9, background: 'color-mix(in srgb, #2e8b57 14%, transparent)', flexShrink: 0 }}>
              <Leaf size={15} strokeWidth={2.2} />
            </span>
            <div>
              <b>How freshness is proven</b> · Every listing carries a Fresco scan: visual quality, freshness score, shelf life and confidence, captured at listing time.
            </div>
          </div>
        </NoteBar>
      </div>
    </>
  )
}