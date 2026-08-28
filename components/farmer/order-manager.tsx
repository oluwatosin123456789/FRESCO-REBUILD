'use client'

import { useEffect, useState } from 'react'
import { FarmerButton, FarmerHeader, FarmerNote, FarmerPill, FarmerSection, FarmerStatusPill } from '@/components/farmer/farmer-ui'
import { ORDERS, fmtCompact, type Order, type OrderItem } from '@/lib/seed/fresco-baseline'
import { api } from '@/lib/client-api'

type ApiOrder = {
  id: string
  reference: string
  status: string
  total: number
  createdAt: string
  items: Array<{ id: string; produce: { name: string; unit: string }; quantity: number; unitPrice: number; total: number }>
  consumer?: { name: string } | null
}

const STATUS_SEQ = ['PAID', 'ACCEPTED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED']

function nextLabel(status: string) {
  switch (status) {
    case 'PAID': return 'Accept'
    case 'ACCEPTED': return 'Start preparing'
    case 'PREPARING': return 'Ready'
    case 'READY': return 'Dispatch'
    case 'OUT_FOR_DELIVERY': return 'Mark delivered'
    case 'DELIVERED': return 'Complete order'
    default: return ''
  }
}

const STAGE_ICON: Record<string, string> = {
  PAID: '✉',
  ACCEPTED: '✓',
  PREPARING: '◔',
  READY: '◐',
  OUT_FOR_DELIVERY: '➤',
  DELIVERED: '✓',
  COMPLETED: '★',
}

export function OrderManager() {
  const [orders, setOrders] = useState<Order[]>(ORDERS)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    api<ApiOrder[]>('/api/orders')
      .then((data) => {
        if (!Array.isArray(data) || data.length === 0) return
        const mapped: Order[] = data
          .filter((o) => o.status !== 'CANCELLED')
          .map((o) => ({
            id: o.reference,
            items: o.items.map((i): OrderItem => ({ name: i.produce.name, qty: `${i.quantity} ${i.produce.unit}`, total: i.total })),
            buyer: o.consumer?.name ?? 'Buyer',
            buyerId: o.consumer?.name?.toLowerCase() ?? 'buyer',
            repeat: false,
            total: o.total,
            status: o.status,
            placed: new Date(o.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
            delivery: 'Delivery · today',
          }))
        setOrders(mapped)
      })
      .catch(() => undefined)
  }, [])

  const advance = (id: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o
        const i = STATUS_SEQ.indexOf(o.status)
        if (i < 0 || i >= STATUS_SEQ.length - 1) return o
        const next = STATUS_SEQ[i + 1]
        if (next === 'COMPLETED') setNotice(`Order ${id} completed · passport recalculated and Wema sees the update.`)
        else setNotice(`Order ${id} advanced to ${next.replace(/_/g, ' ').toLowerCase()}.`)
        return { ...o, status: next }
      })
    )
  }

  return (
    <>
      {/* Hero banner */}
      <div style={{
        position: 'relative', borderRadius: 16, overflow: 'hidden',
        marginBottom: 20, height: 200,
        boxShadow: '0 4px 24px rgba(0,0,0,0.13)',
      }}>
        <img
          src="/assets/hero-orders-fulfillment.jpg"
          alt="Agricultural order fulfillment centre with packed produce boxes and a delivery bike"
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%', display: 'block' }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0) 20%, rgba(10,18,10,0.75) 100%)',
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '18px 24px',
        }}>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 4 }}>Orders</div>
          <div style={{ color: '#fff', fontSize: 22, fontWeight: 750, letterSpacing: '-.3px', lineHeight: 1.1 }}>Fulfillment</div>
          <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12.5, marginTop: 4 }}>Advance an order and the whole system moves</div>
        </div>
      </div>

      <FarmerHeader
        eyebrow="Orders"
        title="Fulfillment"
        subtitle="Advance an order and the whole system moves · completion updates the passport"
      />

      {notice ? (
        <div style={{ marginBottom: 16 }}>
          <FarmerPill tone="green">{notice}</FarmerPill>
        </div>
      ) : null}

      <FarmerSection title="Live queue" subtitle="orders awaiting your next action">
        {orders.length === 0 ? (
          <div className="farmer-empty">
            <div className="farmer-empty-title">Nothing in the queue</div>
            <div className="farmer-empty-sub">Place an order as David and it will appear here instantly.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {orders.map((o) => {
              const completed = o.status === 'COMPLETED'
              return (
                <div className="farmer-row" key={o.id} style={{ flexWrap: 'wrap' }}>
                  <div
                    className="farmer-row-art"
                    style={{
                      background: completed ? '#eef4ee' : 'var(--farmer-blue-soft)',
                      color: completed ? '#2e8b57' : 'var(--farmer-blue)',
                    }}
                  >
                    {STAGE_ICON[o.status] ?? '•'}
                  </div>

                  <div style={{ minWidth: 110, flexShrink: 0 }}>
                    <div style={{ fontFamily: 'var(--farmer-mono)', fontWeight: 600, fontSize: 11, color: 'var(--farmer-ink2)' }}>{o.id}</div>
                    <div style={{ fontSize: 11, color: 'var(--farmer-muted)', marginTop: 3 }}>{o.placed}</div>
                  </div>

                  <div style={{ flex: 1, minWidth: 160 }}>
                    <div style={{ fontWeight: 650, fontSize: 13.5, color: 'var(--farmer-ink)' }}>{o.items.map((i) => i.name).join(' + ')}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'var(--farmer-muted)', marginTop: 3 }}>
                      {o.buyer}
                      {o.repeat ? <FarmerPill tone="gold" style={{ textTransform: 'none', letterSpacing: 0, padding: '1px 6px' }}>repeat</FarmerPill> : null}
                    </div>
                  </div>

                  <div style={{ fontFamily: 'var(--farmer-serif)', fontWeight: 700, fontSize: 15, color: 'var(--farmer-ink)' }}>{fmtCompact(o.total)}</div>
                  <FarmerStatusPill status={o.status} />
                  {completed ? (
                    <FarmerButton tone="outline" small>View</FarmerButton>
                  ) : (
                    <FarmerButton tone="dark" small onClick={() => advance(o.id)}>
                      {nextLabel(o.status)}
                    </FarmerButton>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </FarmerSection>

      <div style={{ marginTop: 18 }}>
        <FarmerNote>
          <b>On completion</b> · the order becomes a verified economic event: passport recalculates, FEAP updates, Wema&apos;s opportunity engine re-runs.
        </FarmerNote>
      </div>
    </>
  )
}