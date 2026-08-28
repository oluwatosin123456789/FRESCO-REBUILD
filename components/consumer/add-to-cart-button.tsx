'use client'

import { useState } from 'react'
import { Check, ShoppingCart } from 'lucide-react'
import { addToCart } from '@/lib/cart'
import { naira } from '@/lib/client-api'

export function AddToCartButton({
  listingId,
  price,
  unit,
  disabled,
}: {
  listingId: string
  price: number
  unit: string
  disabled?: boolean
}) {
  const [added, setAdded] = useState(false)

  return (
    <button
      className="primary-button full"
      style={{ marginTop: 20 }}
      disabled={disabled || added}
      onClick={() => {
        addToCart(listingId, 1)
        setAdded(true)
        setTimeout(() => setAdded(false), 2000)
      }}
    >
      {added ? <Check size={17} /> : <ShoppingCart size={17} />}
      {added ? 'Added to cart' : disabled ? 'Out of stock' : `Add to cart · ${naira(price)}/${unit}`}
      {added && ' · go to marketplace to check out'}
    </button>
  )
}