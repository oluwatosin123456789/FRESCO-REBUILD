'use client'

import { Leaf, MapPin, Star } from 'lucide-react'
import { fmtCompact, type MarketItem } from '@/lib/seed/fresco-baseline'
import { Pill } from '@/components/shared/frame-ui'
import { cartStore, useCartState } from './consumer-store'

const ART: Record<string, { src?: string; bg: string }> = {
  crate: { src: '/assets/products/tomatoes.jpg', bg: '#eaf2fb' },
  pepper: { src: '/assets/products/peppers.jpg', bg: '#f1ebf6' },
  greens: { src: '/assets/products/greens.jpg', bg: '#e8f4ea' },
  cucumber: { src: undefined, bg: '#e4f3ef' },
}

function freshnessColor(freshness: number) {
  if (freshness >= 93) return '#2e8b57'
  if (freshness >= 90) return '#4a8c3f'
  if (freshness >= 87) return '#8aa832'
  return '#c28a32'
}

function FreshnessRing({ freshness, size = 16 }: { freshness: number; size?: number }) {
  const r = size / 2 - 1.5
  const c = 2 * Math.PI * r
  const offset = c * (1 - Math.min(freshness, 100) / 100)
  const color = freshnessColor(freshness)
  return (
    <span title={`${freshness}% freshness`} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth={1.6} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span style={{ font: '700 10px var(--mono)', color: color }}>{freshness}%</span>
    </span>
  )
}

function CucumberArt() {
  return (
    <svg viewBox="0 0 140 180" width="104" height="134" aria-hidden="true">
      <g transform="rotate(-16 70 90)">
        <path d="M70 10 C 40 55, 32 130, 70 170 C 108 130, 100 55, 70 10 Z" fill="#3e9a5c" />
        <path d="M70 10 C 52 55, 46 130, 70 170" fill="none" stroke="#2c7044" strokeWidth="5" strokeLinecap="round" />
        <path d="M70 12 C 60 62, 58 118, 70 168" fill="none" stroke="#2c7044" strokeWidth="3" opacity="0.5" />
        <path d="M70 12 C 80 62, 82 118, 70 168" fill="none" stroke="#2c7044" strokeWidth="3" opacity="0.5" />
        <circle cx="70" cy="8" r="6" fill="#6b7d3a" />
      </g>
    </svg>
  )
}

export function ProductTile({ item }: { item: MarketItem }) {
  const cart = useCartState()
  const inCart = cart[item.id] ?? 0
  const art = ART[item.image] ?? ART.crate

  return (
    <div
      className="consumer-tile"
      style={{
        background: 'var(--panel2)',
        border: '1px solid var(--line)',
        borderRadius: 16,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        className="consumer-tile-art"
        style={{
          height: 132,
          background: art.bg,
          position: 'relative',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        {art.src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={art.src} alt={item.name} loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <CucumberArt />
        )}
        <span style={{ position: 'absolute', top: 10, left: 10, zIndex: 2 }}>
          <Pill tone="green">{item.freshness}% fresh</Pill>
        </span>
        <span style={{ position: 'absolute', bottom: 9, left: 10, zIndex: 2 }}>
          <Pill tone="gold">{item.grade}</Pill>
        </span>
      </div>

      <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
          <h4 style={{ font: '700 15px var(--sans)', color: 'var(--ink)', margin: 0, lineHeight: 1.25 }}>{item.name}</h4>
          <span style={{ font: '700 17px var(--serif)', color: 'var(--ink)', whiteSpace: 'nowrap' }}>
            {fmtCompact(item.price)}
            <span style={{ fontSize: 10.5, fontWeight: 400, color: 'var(--muted)' }}>/{item.unit}</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--muted)' }}>
          <MapPin size={12} strokeWidth={2.2} />
          <span style={{ fontWeight: 600, color: 'var(--ink2)' }}>{item.farm}</span>
          <span>· {item.loc}</span>
          <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--forest)', fontWeight: 600 }}>
            <Star size={11} strokeWidth={2.2} fill="currentColor" /> {item.rating.toFixed(1)}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
          <FreshnessRing freshness={item.freshness} />
          <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>shelf life {item.shelfLife}d</span>
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 6 }}>
          {inCart > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                type="button"
                onClick={() => cartStore.setQty(item.id, inCart - 1)}
                style={{ width: 27, height: 27, borderRadius: 8, border: '1px solid var(--line)', background: 'var(--panel)', cursor: 'pointer', fontSize: 15, color: 'var(--ink)', display: 'grid', placeItems: 'center' }}
                aria-label={`Remove one ${item.name}`}
              >
                −
              </button>
              <b style={{ minWidth: 14, textAlign: 'center', color: 'var(--ink)' }}>{inCart}</b>
              <button
                type="button"
                onClick={() => cartStore.setQty(item.id, inCart + 1)}
                style={{ width: 27, height: 27, borderRadius: 8, border: '1px solid var(--line)', background: 'var(--panel)', cursor: 'pointer', fontSize: 15, color: 'var(--ink)', display: 'grid', placeItems: 'center' }}
                aria-label={`Add one ${item.name}`}
              >
                +
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => cartStore.add(item.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                background: 'var(--dark)',
                color: '#ffffff',
                border: 0,
                borderRadius: 9,
                padding: '8px 14px',
                fontSize: 12.5,
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 10px 20px rgba(17,17,17,.14)',
                transition: 'transform .15s ease, background .15s ease',
              }}
            >
              <Leaf size={14} strokeWidth={2.2} /> Add to cart
            </button>
          )}
        </div>
      </div>
    </div>
  )
}