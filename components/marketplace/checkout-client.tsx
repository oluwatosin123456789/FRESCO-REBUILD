'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { ArrowLeft, Check, Loader2, Lock, MapPin, ShieldCheck, Truck } from 'lucide-react'
import { products } from '@/lib/landing/content'
import { cartCount, cartTotal, formatNaira, linesFor, parsePrice, useCart } from './cart'
import { cutoutFor } from './product-card'

type Step = 'form' | 'processing' | 'success'

const PAYMENT_METHODS = [
  { id: 'bank', label: 'Bank Transfer', note: 'Central Switch Settlement', icon: '🏦' },
  { id: 'card', label: 'Debit Card', note: 'NIBSS / Interswitch', icon: '💳' },
  { id: 'wallet', label: 'Fresco Wallet', note: 'Instant Debit', icon: '👛' },
]

const DELIVERY_WINDOWS = ['Today, 4–6pm', 'Tomorrow, 9–11am', 'Tomorrow, 4–6pm']

const TRACKING_STEPS = [
  { key: 'PAID', label: 'Paid', note: 'Payment verified on Central Switch' },
  { key: 'ACCEPTED', label: 'Accepted', note: 'Farmer confirms the order' },
  { key: 'PREPARING', label: 'Preparing', note: 'Produce picked and packed' },
  { key: 'READY', label: 'Ready', note: 'Handed to logistics' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for delivery', note: 'On the way to you' },
  { key: 'DELIVERED', label: 'Delivered', note: 'QR verified at your door' },
  { key: 'COMPLETED', label: 'Completed', note: 'Funds released to farmer' },
]

export function CheckoutClient() {
  const { cart, setQuantity } = useCart()
  const lines = useMemo(() => linesFor(cart, products), [cart])
  const total = useMemo(() => cartTotal(cart, products), [cart])
  const count = cartCount(cart)

  const [step, setStep] = useState<Step>('form')
  const [payment, setPayment] = useState('bank')
  const [windowIdx, setWindowIdx] = useState(0)
  const [orderRef, setOrderRef] = useState('')

  const placeOrder = () => {
    setStep('processing')
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setOrderRef(`HL${1025 + Math.floor(Math.random() * 900)}`)

    setTimeout(() => {
      // Show the confirmation first, then release the basket.
      setStep('success')
      lines.forEach(({ product }) => setQuantity(product.batch, 0))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 2600)
  }

  /* ---------- empty state ---------- */
  if (lines.length === 0 && step !== 'success') {
    return (
      <div className="checkout-page">
        <header className="checkout-header">
          <Link href="/marketplace" className="checkout-back">
            <ArrowLeft size={15} /> Back to market
          </Link>
          <span className="checkout-brand">
            fres<span>co</span>
          </span>
        </header>
        <div className="checkout-empty">
          <h1>Your basket is empty</h1>
          <p>Add some verified produce to continue to checkout.</p>
          <Link href="/marketplace" className="button button-dark">
            Browse the market
          </Link>
        </div>
      </div>
    )
  }

  /* ---------- processing ---------- */
  if (step === 'processing') {
    return (
      <div className="checkout-page">
        <div className="checkout-processing">
          <div className="checkout-spinner">
            <Loader2 size={28} />
          </div>
          <h1>Securing settlement</h1>
          <p>Routing payment through the Central Switch and notifying the farmer…</p>
          <div className="checkout-progress-track">
            <span className="checkout-progress-fill" />
          </div>
          <small>Fresco Escrow holds funds until QR-verified delivery.</small>
        </div>
      </div>
    )
  }

  /* ---------- success ---------- */
  if (step === 'success') {
    return (
      <div className="checkout-page">
        <div className="checkout-success">
          <div className="checkout-success-ring">
            <Check size={30} strokeWidth={3} />
          </div>
          <p className="checkout-eyebrow">Escrow secured</p>
          <h1>Payment verified</h1>
          <p className="checkout-success-lead">
            Order <strong>{orderRef}</strong> is confirmed and the farmer has been notified. Track it live as it
            moves from farm to your door.
          </p>

          <div className="checkout-tracking">
            {TRACKING_STEPS.map((s, i) => {
              const done = i === 0
              const current = i === 0
              return (
                <div key={s.key} className={`checkout-track-step ${done ? 'done' : ''} ${current ? 'current' : ''}`}>
                  <div className="checkout-track-dot">{done ? <Check size={12} strokeWidth={3} /> : <span>{i + 1}</span>}</div>
                  <div className="checkout-track-body">
                    <b>{s.label}</b>
                    <small>{s.note}</small>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="checkout-success-actions">
            <Link href="/consumer/orders" className="button button-dark">
              <Truck size={15} /> Track order
            </Link>
            <Link href="/marketplace" className="button button-light">
              Keep shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  /* ---------- form ---------- */
  return (
    <div className="checkout-page">
      <header className="checkout-header">
        <Link href="/marketplace" className="checkout-back">
          <ArrowLeft size={15} /> Back to market
        </Link>
        <span className="checkout-brand">
          fres<span>co</span>
        </span>
        <span className="checkout-secure">
          <Lock size={13} /> Secured by Escrow
        </span>
      </header>

      <main className="checkout-main">
        <div className="checkout-heading">
          <p className="checkout-eyebrow">Checkout</p>
          <h1>Complete your order</h1>
          <p className="checkout-count">
            {count} item{count === 1 ? '' : 's'}
          </p>
        </div>

        <div className="checkout-grid">
          <div className="checkout-stack">
            <section className="checkout-card">
              <h2>Delivery details</h2>
              <div className="checkout-field">
                <label>Full name</label>
                <input defaultValue="David Adeyemi" />
              </div>
              <div className="checkout-field">
                <label>Phone</label>
                <input defaultValue="+234 803 000 0000" />
              </div>
              <div className="checkout-field">
                <label>Delivery address</label>
                <input defaultValue="14 Unity Road, Ikorodu, Lagos" />
              </div>
              <div className="checkout-field">
                <label>Delivery window</label>
                <div className="checkout-windows">
                  {DELIVERY_WINDOWS.map((w, i) => (
                    <button key={w} type="button" className={windowIdx === i ? 'on' : ''} onClick={() => setWindowIdx(i)}>
                      {w}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <section className="checkout-card">
              <h2>Payment method</h2>
              {PAYMENT_METHODS.map((m) => (
                <button key={m.id} type="button" className={`checkout-pay ${payment === m.id ? 'on' : ''}`} onClick={() => setPayment(m.id)}>
                  <span className="checkout-pay-icon">{m.icon}</span>
                  <span className="checkout-pay-body">
                    <b>{m.label}</b>
                    <small>{m.note}</small>
                  </span>
                  <span className="checkout-pay-radio">{payment === m.id ? <Check size={14} /> : null}</span>
                </button>
              ))}
              <p className="checkout-note">
                <ShieldCheck size={13} /> Secured by Fresco Escrow &amp; Settlement Protocol.
              </p>
            </section>
          </div>

          <section className="checkout-card checkout-summary">
            <h2>Order summary</h2>
            <ul className="checkout-items">
              {lines.map(({ product, quantity }) => (
                <li key={product.batch}>
                  <Image src={cutoutFor(product)} alt="" width={44} height={44} />
                  <div className="checkout-item-body">
                    <b>{product.name}</b>
                    <small>{quantity} × {formatNaira(parsePrice(product.price))}</small>
                  </div>
                  <strong>{formatNaira(parsePrice(product.price) * quantity)}</strong>
                </li>
              ))}
            </ul>
            <div className="checkout-line">
              <span>Subtotal</span>
              <b>{formatNaira(total)}</b>
            </div>
            <div className="checkout-line">
              <span>Delivery</span>
              <b className="checkout-free">Free</b>
            </div>
            <div className="checkout-line checkout-total">
              <span>Total</span>
              <b>{formatNaira(total)}</b>
            </div>
            <button type="button" className="button button-dark checkout-pay-btn" onClick={placeOrder}>
              <Lock size={15} /> Authorize {formatNaira(total)}
            </button>
            <p className="checkout-note">
              <MapPin size={13} /> Verified payment rail with instant farmer settlement on delivery confirmation.
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
