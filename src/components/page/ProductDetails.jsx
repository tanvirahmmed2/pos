'use client'
import React, { useState, useEffect, useContext } from 'react'
import Image from 'next/image'
import { CiShoppingCart } from "react-icons/ci"
import { Context } from '../helper/Context'
import { motion, AnimatePresence } from 'framer-motion'
import { Check } from 'lucide-react'

const ProductDetails = ({ product }) => {
    const { addToCart } = useContext(Context)


    const currentPrice = product.sale_price - product.discount_price
    const currentStock = product.stock
    const currentImage = product.image
    const isOutOfStock = currentStock <= 0

    const handleAddToCart = () => {
        addToCart(product)
    }

    return (
        <div className='w-full md:w-5/6 lg:w-3/4 mx-auto flex flex-col lg:flex-row gap-12 bg-white m-6 p-6 md:p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100'>

            {/* Left: Product Image */}
            <div className='w-full lg:w-1/2'>
                <div className='relative aspect-square overflow-hidden rounded-3xl bg-slate-50 border border-slate-100 shadow-inner group'>
                    <div className='absolute right-4 top-4 z-10'>
                        {!isOutOfStock ? (
                            <span className='text-[10px] font-black uppercase tracking-[0.2em] text-white py-2 px-4 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30'>
                                In Stock
                            </span>
                        ) : (
                            <span className='text-[10px] font-black uppercase tracking-[0.2em] text-white py-2 px-4 rounded-full bg-rose-500 shadow-lg shadow-rose-500/30'>
                                Out of Stock
                            </span>
                        )}
                    </div>
                    
                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={currentImage}
                            initial={{ opacity: 0, scale: 1.1 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.4 }}
                            className="relative w-full h-full"
                        >
                            <Image
                                src={currentImage}
                                alt={product?.name}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            <div className='w-full lg:w-1/2 flex flex-col justify-between py-2'>
                <div className="space-y-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-widest rounded-full">
                                {product.category_name}
                            </span>
                            {product.brand_name && (
                                <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest rounded-full">
                                    {product.brand_name}
                                </span>
                            )}
                        </div>
                        <h1 className='text-2xl md:text-4xl font-black text-slate-900 leading-[1.1] tracking-tight'>
                            {product.name}
                        </h1>
                    </div>



                    <div className='flex items-center justify-between pt-8 border-t border-slate-100'>
                        <div className='flex flex-col'>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Price</p>
                            <div className="flex items-baseline gap-3">
                                <p className='font-black text-4xl text-slate-900 tracking-tighter'>৳{currentPrice}</p>
                                {product?.discount_price > 0 && (
                                    <p className='text-slate-400 text-sm line-through font-medium'>৳{product.sale_price}</p>
                                )}
                            </div>
                        </div>
                        <div className='text-right'>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Available</p>
                            <p className={`text-xl font-black ${isOutOfStock ? 'text-rose-500' : 'text-slate-900'}`}>
                                {currentStock} <span className="text-sm font-bold text-slate-400 uppercase ml-0.5">{product.unit}</span>
                            </p>
                        </div>
                    </div>

                    <div className="pt-4 flex flex-col sm:flex-row gap-4">
                        <button 
                            onClick={handleAddToCart}
                            disabled={isOutOfStock}
                            className={`flex-1 py-3 cursor-pointer rounded-md flex items-center justify-center gap-3 text-white font-black text-sm uppercase tracking-widest transition-all duration-300 active:scale-95 ${
                                isOutOfStock 
                                ? 'bg-slate-200 cursor-not-allowed text-slate-400' 
                                : 'bg-primary hover:bg-slate-900 shadow-xl shadow-primary/20 hover:shadow-slate-900/20'
                            }`}
                        >
                            <span>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
                            <CiShoppingCart className='text-2xl stroke-2' />
                        </button>
                    </div>

                    <div className="space-y-3 pt-6 border-t border-slate-100">
                        <h4 className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">Description</h4>
                        <p className='text-slate-600 leading-relaxed text-sm font-medium'>
                            {product.description || "Indulge in our premium quality product, crafted with excellence."}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProductDetails
