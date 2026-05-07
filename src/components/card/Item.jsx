'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import React, { useContext, useState } from 'react'
import Image from 'next/image'
import { Context } from '../helper/Context'
import { ShoppingCart, Check } from 'lucide-react'

const Item = ({ product }) => {
  const { addToCart } = useContext(Context)
  const [added, setAdded] = useState(false)

  const salePrice = Number(product?.sale_price) || 0
  const discountPrice = Number(product?.discount_price) || 0
  const currentPrice = discountPrice > 0 ? salePrice - discountPrice : salePrice
  const discountPct = discountPrice > 0 ? Math.round((discountPrice / salePrice) * 100) : 0
  const isNew = product?.is_new ?? true

  const handleAddToCart = (e) => {
    e.preventDefault()
    addToCart(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35 }}
      className="group relative w-full flex flex-col bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300"
    >
      {/* ── Image ── */}
      <Link href={`/products/${product.slug}`} className="relative block w-full overflow-hidden" style={{ aspectRatio: '1/1' }}>

        {/* Badges */}
        <div className="absolute top-2 left-2 z-20 flex flex-col gap-1">
          {discountPct > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full leading-tight">
              -{discountPct}%
            </span>
          )}
          {isNew && discountPct === 0 && (
            <span className="bg-sky-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full leading-tight">
              New
            </span>
          )}
        </div>

        <Image
          src={product?.image || '/placeholder.jpg'}
          alt={product?.name || 'Product'}
          width={400}
          height={400}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </Link>

      {/* ── Info ── */}
      <div className="flex flex-col flex-1 p-3 gap-2">

        {/* Category / Brand */}
        {(product?.category_name || product?.brand_name) && (
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 line-clamp-1">
            {product.category_name || product.brand_name}
          </p>
        )}

        {/* Name */}
        <Link href={`/products/${product.slug}`}>
          <h2 className="text-sm font-semibold text-gray-800 hover:text-sky-600 transition-colors line-clamp-2 leading-snug">
            {product?.name}
          </h2>
        </Link>

        {/* Price row */}
        <div className="flex items-baseline gap-2 mt-auto pt-1">
          <span className="text-base font-bold text-gray-900">৳{currentPrice}</span>
          {discountPct > 0 && (
            <span className="text-xs text-gray-400 line-through">৳{salePrice}</span>
          )}
        </div>

        {/* Add to Cart button — always visible, touch-friendly */}
        <button
          onClick={handleAddToCart}
          className={`
            mt-1 w-full flex items-center justify-center gap-2
            py-2.5 rounded-lg text-sm font-semibold
            transition-all duration-300
            ${added
              ? 'bg-green-500 text-white'
              : 'bg-gray-900 text-white hover:bg-sky-600 active:scale-95'
            }
          `}
        >
          {added ? (
            <>
              <Check size={15} />
              Added
            </>
          ) : (
            <>
              <ShoppingCart size={15} />
              Add to Cart
            </>
          )}
        </button>
      </div>
    </motion.div>
  )
}

export default Item
