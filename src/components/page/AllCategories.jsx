'use client'
import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const BG_PAIRS = [
  { bg: '#FFF1F2', text: '#E11D48' },
  { bg: '#EFF6FF', text: '#2563EB' },
  { bg: '#F5F3FF', text: '#7C3AED' },
  { bg: '#FFFBEB', text: '#D97706' },
  { bg: '#F0FDF4', text: '#16A34A' },
  { bg: '#FDF4FF', text: '#A21CAF' },
  { bg: '#F0F9FF', text: '#0284C7' },
  { bg: '#FFF7ED', text: '#EA580C' },
]

const AllCategories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(true)
  const scrollRef = useRef(null)

  useEffect(() => {
    axios.get('/api/product/category')
      .then(res => {
        if (res.data.success) setCategories(res.data.payload || [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const updateArrows = () => {
    const el = scrollRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 4)
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }

  const scroll = (dir) => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir * 280, behavior: 'smooth' })
  }

  return (
    <section className="w-full py-14 px-4 md:px-10 lg:px-20 bg-slate-50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="flex items-end justify-between mb-8 border-b border-slate-200 pb-4"
      >
        <div>
          <p className="text-xs font-semibold text-slate-800 uppercase tracking-widest mb-1">Shop By</p>
          <h2 className="text-2xl font-bold text-slate-800">All Categories</h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Arrow buttons */}
          <button
            onClick={() => scroll(-1)}
            disabled={!canLeft}
            className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-200 ${
              canLeft
                ? 'border-slate-300 text-slate-600 hover:border-slate-500 hover:text-slate-900'
                : 'border-slate-100 text-slate-300 cursor-not-allowed'
            }`}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => scroll(1)}
            disabled={!canRight}
            className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-200 ${
              canRight
                ? 'border-slate-300 text-slate-600 hover:border-slate-500 hover:text-slate-900'
                : 'border-slate-100 text-slate-300 cursor-not-allowed'
            }`}
          >
            <ChevronRight size={16} />
          </button>

          <Link
            href="/products"
            className="ml-2 text-sm text-slate-500 hover:text-slate-800 transition-colors duration-200 underline underline-offset-4"
          >
            View All
          </Link>
        </div>
      </motion.div>

      {/* Skeleton */}
      {loading ? (
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse flex-shrink-0 flex flex-col items-center gap-3 p-5 bg-white rounded-xl w-28">
              <div className="w-14 h-14 rounded-full bg-slate-100" />
              <div className="h-3 w-14 bg-slate-100 rounded-full" />
            </div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <p className="text-center text-slate-400 py-10">No categories found.</p>
      ) : (
        <div className="relative">
          {/* Scrollable row */}
          <div
            ref={scrollRef}
            onScroll={updateArrows}
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {categories.map((cat, i) => {
              const pair = BG_PAIRS[i % BG_PAIRS.length]
              const initial = cat.name?.charAt(0).toUpperCase() || '?'
              return (
                <Link
                  key={cat.category_id}
                  href={`/products/category/${cat.category_id}`}
                  className="group flex-shrink-0 flex flex-col items-center gap-3 p-5 bg-white rounded-xl border border-slate-100 hover:border-slate-300 hover:shadow-md transition-all duration-200 w-28"
                >
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-black transition-transform duration-200 group-hover:scale-110"
                    style={{ backgroundColor: pair.bg, color: pair.text }}
                  >
                    {initial}
                  </div>
                  <span className="text-[12px] font-semibold text-slate-700 group-hover:text-slate-900 text-center leading-tight line-clamp-2">
                    {cat.name}
                  </span>
                </Link>
              )
            })}
          </div>

          {/* Fade edges */}
          {canLeft && (
            <div className="absolute top-0 left-0 h-full w-10 bg-gradient-to-r from-slate-50 to-transparent pointer-events-none" />
          )}
          {canRight && (
            <div className="absolute top-0 right-0 h-full w-10 bg-gradient-to-l from-slate-50 to-transparent pointer-events-none" />
          )}
        </div>
      )}
    </section>
  )
}

export default AllCategories
