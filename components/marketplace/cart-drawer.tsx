'use client'

import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Minus, Plus, Trash2, ShoppingBasket, ArrowRight } from 'lucide-react'
import { cutoutFor } from './product-card'
import { formatNaira, parsePrice, type CartLine } from './cart'

export function CartDrawer({
  open,
  lines,
  total,
  onUpdateQuantity,
  onRemove,
  onClose,
}: {
  open: boolean
  lines: CartLine[]
  total: number
  onUpdateQuantity: (batch: string, quantity: number) => void
  onRemove: (batch: string) => void
  onClose: () => void
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.aside
            className="cart-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Your cart"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 42 }}
          >
            <header className="cart-header">
              <h2>Your cart</h2>
              <button className="cart-close" type="button" onClick={onClose} aria-label="Close cart">
                <X size={18} aria-hidden="true" />
              </button>
            </header>

            {lines.length === 0 ? (
              <div className="cart-empty">
                <ShoppingBasket size={30} aria-hidden="true" />
                <p>Your cart is empty.</p>
                <p className="cart-empty-note">Verified produce from the field will appear here.</p>
              </div>
            ) : (
              <ul className="cart-items">
                {lines.map(({ product, quantity }) => (
                  <li key={product.batch} className="cart-item">
                    <Image src={cutoutFor(product)} alt="" width={64} height={64} />
                    <div className="cart-item-body">
                      <strong>{product.name}</strong>
                      <span className="cart-item-batch">{product.batch}</span>
                      <span className="cart-item-price">
                        {formatNaira(parsePrice(product.price) * quantity)}
                        <small>· {quantity} × {product.price}/{product.unit}</small>
                      </span>
                    </div>
                    <div className="cart-item-controls">
                      <button type="button" onClick={() => onUpdateQuantity(product.batch, quantity - 1)} aria-label={`Decrease ${product.name} quantity`}>
                        <Minus size={13} aria-hidden="true" />
                      </button>
                      <span>{quantity}</span>
                      <button type="button" onClick={() => onUpdateQuantity(product.batch, quantity + 1)} aria-label={`Increase ${product.name} quantity`}>
                        <Plus size={13} aria-hidden="true" />
                      </button>
                      <button className="cart-item-remove" type="button" onClick={() => onRemove(product.batch)} aria-label={`Remove ${product.name} from cart`}>
                        <Trash2 size={14} aria-hidden="true" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <footer className="cart-footer">
              <div className="cart-total">
                <span>Total</span>
                <strong>{formatNaira(total)}</strong>
              </div>
              <a className="button button-dark cart-checkout" href="/marketplace/checkout">
                Proceed to Checkout <ArrowRight size={15} aria-hidden="true" />
              </a>
              <p className="demo-note">Verified Checkout · Escrow secured by Fresco Network.</p>
            </footer>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}