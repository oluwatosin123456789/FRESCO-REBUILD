'use client'

import { useEffect, useState } from 'react'
import { Btn, Card, EmptyCard, PageHeader, Pill, statusPill } from '@/components/shared/frame-ui'
import { fmtFull } from '@/lib/seed/fresco-baseline'
import { api } from '@/lib/client-api'

type Order = {
  id: string
  reference: string
  status: string
  total: number
  createdAt: string
  items: Array<{ id: string; produce: { name: string; unit: string }; quantity: number; unitPrice: number; total: number }>
  farmer?: { farmName: string } | null
  reviews?: Array<{ rating: number }> | null
}

export function OrderTracker() {
  const [orders, setOrders] = useState<Order[]>([])
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [ratings, setRatings] = useState<Record<string, number>>({})

  const load = () => {
    api<Order[]>('/api/orders').then(setOrders).catch((e) => setError(e.message))
  }
  useEffect(() => { load() }, [])

  const confirmReceipt = async (orderId: string) => {
    try {
      await api(`/api/orders/${orderId}`, { method: 'PATCH', body: JSON.stringify({ status: 'COMPLETED' }) })
      setNotice('Order confirmed · passport recalculated.')
      load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Confirmation failed')
    }
  }

  const review = async (orderId: string) => {
    try {
      await api('/api/reviews', { method: 'POST', body: JSON.stringify({ orderId, rating: ratings[orderId] ?? 5, comment: 'Great produce!' }) })
      setNotice('Review submitted · it feeds the farmer reputation metrics.')
      load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Review failed')
    }
  }

  return (
    <>
      <PageHeader eyebrow="Orders" title="Track your orders" lede="Live fulfilment progress. Completed orders build the farmer's Financial Passport." />

      {error ? <div style={{ marginBottom: 16 }}><Pill tone="warn">{error}</Pill></div> : null}
      {notice ? <div style={{ marginBottom: 16 }}><Pill tone="green">{notice}</Pill></div> : null}

      {orders.length === 0 ? (
        <EmptyCard>
          <b style={{ font: '700 18px var(--serif)' }}>No orders yet</b>
          <p style={{ color: 'var(--muted)', fontSize: 13.5, marginTop: 6 }}>When you buy, your order will appear here with live tracking.</p>
          <div style={{ marginTop: 16 }}><Btn tone="dark" href="/consumer/browse">Visit the market</Btn></div>
        </EmptyCard>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {orders.map((order) => (
            <Card key={order.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <b style={{ fontSize: 14.5, color: 'var(--ink)' }}>{order.reference}</b>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                    {order.farmer?.farmName ?? 'Farm'} · {new Date(order.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {statusPill(order.status)}
                  <b style={{ font: '700 16px var(--serif)', color: 'var(--ink)' }}>{fmtFull(order.total)}</b>
                </div>
              </div>

              <div style={{ marginTop: 12, borderTop: '1px solid var(--line)', paddingTop: 12 }}>
                {order.items.map((item) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13 }}>
                    <span style={{ color: 'var(--ink)' }}>
                      {item.quantity}× {item.produce.name}
                    </span>
                    <b style={{ color: 'var(--ink2)' }}>{fmtFull(item.quantity * item.unitPrice)}</b>
                  </div>
                ))}
              </div>

              {order.status === 'DELIVERED' ? (
                <div style={{ marginTop: 12 }}>
                  <Btn tone="green" onClick={() => confirmReceipt(order.id)}>Confirm receipt · mark complete</Btn>
                </div>
              ) : null}

              {order.status === 'COMPLETED' && !order.reviews?.length ? (
                <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13, color: 'var(--ink2)' }}>Rate this order:</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRatings((prev) => ({ ...prev, [order.id]: star }))}
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 8,
                        border: '1px solid var(--line)',
                        background: (ratings[order.id] ?? 0) >= star ? 'var(--gold)' : 'var(--panel2)',
                        color: (ratings[order.id] ?? 0) >= star ? '#fff' : 'var(--ink2)',
                        cursor: 'pointer',
                      }}
                    >
                      ★
                    </button>
                  ))}
                  <Btn tone="dark" small onClick={() => review(order.id)}>Submit review</Btn>
                </div>
              ) : null}
            </Card>
          ))}
        </div>
      )}
    </>
  )
}
