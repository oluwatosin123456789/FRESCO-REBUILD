'use client'

import { Btn, EmptyCard, PageHeader } from '@/components/shared/frame-ui'
import { fmtCompact } from '@/lib/seed/fresco-baseline'
import { cartStore, countFor, linesFor, totalFor, useCartState, useCatalog } from './consumer-store'

export function ConsumerCart() {
  const items = useCatalog()
  const cart = useCartState()
  const lines = linesFor(items, cart)
  const total = totalFor(items, cart)
  const count = countFor(cart)

  return (
    <>
      <PageHeader
        eyebrow="Basket"
        title="Your basket"
        action={lines.length > 0 ? <Btn tone="outline" small onClick={() => cartStore.clear()}>Clear</Btn> : undefined}
      />

      {lines.length === 0 ? (
        <EmptyCard>
          <b style={{ font: '700 18px var(--serif)' }}>Your basket is empty</b>
          <p style={{ color: 'var(--muted)', fontSize: 13.5, marginTop: 6 }}>
            Head to the <a href="/consumer/browse" style={{ color: 'var(--green)', fontWeight: 600 }}>market</a> to add fresh produce.
          </p>
        </EmptyCard>
      ) : (
        <div className="split-grid">
          <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 14, padding: 20 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--line)' }}>
                  {['Item', 'Price', 'Qty', 'Total'].map((h) => (
                    <th key={h} style={{ font: '600 10px var(--mono)', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)', textAlign: 'left', padding: '8px 12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lines.map(({ item, qty }) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--line)' }}>
                    <td style={{ padding: '10px 12px' }}>
                      <b style={{ color: 'var(--ink)' }}>{item.name}</b>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{item.farm}</div>
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--ink)' }}>{fmtCompact(item.price)}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <button type="button" onClick={() => cartStore.setQty(item.id, qty - 1)} style={{ width: 24, height: 24, borderRadius: 7, border: '1px solid var(--line)', background: 'var(--panel2)', cursor: 'pointer' }}>−</button>
                        <b style={{ minWidth: 14, textAlign: 'center' }}>{qty}</b>
                        <button type="button" onClick={() => cartStore.setQty(item.id, qty + 1)} style={{ width: 24, height: 24, borderRadius: 7, border: '1px solid var(--line)', background: 'var(--panel2)', cursor: 'pointer' }}>+</button>
                      </div>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <b style={{ color: 'var(--ink)' }}>{fmtCompact(item.price * qty)}</b>
                      <button type="button" onClick={() => cartStore.setQty(item.id, 0)} style={{ border: 0, background: 'none', color: 'var(--clay)', fontSize: 12, cursor: 'pointer', padding: 0, marginLeft: 8 }}>
                        remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 14, padding: 20 }}>
            <div style={{ font: '600 10.5px var(--mono)', letterSpacing: '.09em', textTransform: 'uppercase', color: 'var(--muted)' }}>Order summary</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontSize: 13 }}>
              <span style={{ color: 'var(--ink2)' }}>Subtotal</span>
              <b style={{ color: 'var(--ink)' }}>{fmtCompact(total)}</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontSize: 13 }}>
              <span style={{ color: 'var(--ink2)' }}>Delivery (Ikorodu)</span>
              <b style={{ color: 'var(--green)' }}>Free</b>
            </div>
            <div style={{ height: 1, background: 'var(--line)', margin: '10px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 15 }}>
              <span style={{ fontWeight: 600, color: 'var(--ink)' }}>Total</span>
              <b style={{ color: 'var(--ink)' }}>{fmtCompact(total)}</b>
            </div>
            <div style={{ marginTop: 12 }}>
              <Btn tone="dark" block>Checkout · {fmtCompact(total)}</Btn>
            </div>
            <p style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 10, lineHeight: 1.5 }}>
              Fresco Escrow Guarantee · funds released upon physical delivery and QR verification. ({count} item{count === 1 ? '' : 's'})
            </p>
          </div>
        </div>
      )}
    </>
  )
}
