'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Item from '../card/Item'
import { motion } from 'framer-motion'

const LatestProducts = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get('/api/product/showcase')
      .then(res => {
        if (res.data.success) setProducts(res.data.latest || [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="w-full py-14 px-4 md:px-10 lg:px-20 bg-white">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="flex items-end justify-between mb-8 border-b border-slate-200 pb-4"
      >
        <div>
          <p className="text-xs font-semibold text-slate-800 uppercase tracking-widest mb-1">New Arrivals</p>
          <h2 className="text-2xl font-bold text-slate-800">Latest Products</h2>
        </div>
        <a
          href="/products"
          className="text-sm text-slate-500 hover:text-slate-800 transition-colors duration-200 underline underline-offset-4"
        >
          View All
        </a>
      </motion.div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-slate-100 rounded-sm mb-2" />
              <div className="h-3 bg-slate-100 rounded w-3/4 mb-1" />
              <div className="h-3 bg-slate-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <p className="text-center text-slate-400 py-10">No products found.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {products.map(product => (
            <Item key={product.product_id} product={product} />
          ))}
        </div>
      )}
    </section>
  )
}

export default LatestProducts
