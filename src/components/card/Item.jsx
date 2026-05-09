'use client'
import { motion } from 'framer-motion'
import React, { useContext, useState } from 'react'
import Image from 'next/image'
import { Context } from '../helper/Context'

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
    setTimeout(() => setAdded(false), 500)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35 }}
      onClick={handleAddToCart}
      className={`group relative w-full flex flex-col rounded-xl overflow-hidden border shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer select-none
        ${added ? 'bg-slate-50 border-slate-300 scale-[0.98]' : 'bg-white border-slate-100'}`}
    >
      {/* ── Image ── */}
      <div className="relative block w-full overflow-hidden" style={{ aspectRatio: '1/1' }}>

        {/* Badges */}
        <div className="absolute top-2 left-2 z-20 flex flex-col gap-1">
          {discountPct > 0 && (
            <span className="bg-slate-800 text-white text-[10px] font-bold px-2 py-0.5 rounded-full leading-tight">
              -{discountPct}%
            </span>
          )}
          {isNew && discountPct === 0 && (
            <span className="bg-slate-800 text-white text-[10px] font-bold px-2 py-0.5 rounded-full leading-tight">
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
      </div>

      {/* ── Info ── */}
      <div className="flex flex-col flex-1 p-3 gap-1">
        {/* Category / Brand */}
        {(product?.category_name || product?.brand_name) && (
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 line-clamp-1">
            {product.category_name || product.brand_name}
          </p>
        )}

        {/* Name */}
        <h2 className="text-sm font-semibold text-slate-800 transition-colors line-clamp-2 leading-snug">
          {product?.name}
        </h2>

        {/* Price row */}
        <div className="flex items-baseline gap-2 mt-auto pt-1">
          <span className="text-base font-bold text-slate-900">৳{currentPrice}</span>
          {discountPct > 0 && (
            <span className="text-xs text-slate-400 line-through">৳{salePrice}</span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default Item
