'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Leaf, ShoppingBasket } from 'lucide-react'
import { type Product } from '@/lib/landing/content'
import { usePointerTilt } from '@/lib/landing/pointer-tilt'

export function cutoutFor(product: Product) {
  const name = product.name.toLowerCase()
  if (name.includes('bell pepper') || name.includes('sweet pepper')) return '/assets/products/bell-peppers.jpg'
  if (product.batch.startsWith('PEP') || name.includes('pepper') || name.includes('habanero')) return '/assets/products/peppers.jpg'
  if (product.batch.startsWith('GRN') || name.includes('green') || name.includes('ugu') || name.includes('spinach')) return '/assets/products/greens.jpg'
  if (product.batch.startsWith('ONI') || name.includes('onion')) return '/assets/products/onions.jpg'
  if (product.batch.startsWith('YAM') || name.includes('yam') || name.includes('tuber')) return '/assets/products/yams.jpg'
  if (product.batch.startsWith('PLA') || name.includes('plantain')) return '/assets/products/plantains.jpg'
  return '/assets/products/tomatoes.jpg'
}

// Freshness color is derived from the freshness band, so each product's
// indicator reads slightly different.
function freshnessColor(freshness: number) {
  if (freshness >= 93) return '#2e8b57'
  if (freshness >= 90) return '#4a8c3f'
  if (freshness >= 87) return '#8aa832'
  return '#c28a32'
}

export function ProductCard({
  product,
  index,
  onAddToCart,
}: {
  product: Product
  index: number
  onAddToCart?: (product: Product) => void
}) {
  const tilt = usePointerTilt()
  const freshColor = freshnessColor(product.freshness)

  return (
    <motion.article
      className="product-card"
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, delay: (index % 4) * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="product-card-inner"
        style={{ rotateX: tilt.rotateX, rotateY: tilt.rotateY, x: tilt.translateX, y: tilt.translateY }}
        {...tilt.onPointerMove}
        {...tilt.onPointerLeave}
      >
        <div className="product-image">
          <Image
            src={cutoutFor(product)}
            alt={`${product.name} · ${product.label}`}
            width={560}
            height={420}
            sizes="(max-width: 1280px) 50vw, 25vw"
          />
          <span className="product-demo-label" style={{ background: '#2D4739', color: '#fff' }}>
            Verified Harvest
          </span>
          <span className="product-freshness" style={{ color: freshColor }} title={`${product.freshness}% freshness · ${product.batch}`}>
            <Leaf size={11} strokeWidth={2.4} aria-hidden="true" />
            {product.freshness}% fresh
          </span>
        </div>

        <div className="product-body">
          <h3 className="product-name">{product.name}</h3>
          <p className="product-shelf">
            <Leaf size={12} strokeWidth={2.2} aria-hidden="true" />
            Shelf life · {product.shelfLife}
          </p>

          <div className="product-footer">
            <span className="product-batch">{product.batch}</span>
            <strong className="product-price">
              {product.price}
              <small>/ {product.unit}</small>
            </strong>
          </div>

          {onAddToCart ? (
            <button className="product-cta" type="button" onClick={() => onAddToCart(product)}>
              <ShoppingBasket size={15} strokeWidth={2.2} aria-hidden="true" /> Add to cart
            </button>
          ) : (
            <a className="product-cta" href="/auth/login">
              View listing
            </a>
          )}
        </div>
      </motion.div>
    </motion.article>
  )
}