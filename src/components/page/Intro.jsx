'use client'
import Image from 'next/image'
import React, { useContext, useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, RefreshCw } from 'lucide-react'
import { Context } from '../helper/Context'

const images = [
    'https://res.cloudinary.com/dv30hn53t/image/upload/v1777972932/pexels-rachel-claire-5531549_akfkue.jpg',
    'https://res.cloudinary.com/dv30hn53t/image/upload/v1777972936/pexels-zion-30109290_xqle28.jpg',
    'https://res.cloudinary.com/dv30hn53t/image/upload/v1777972934/pexels-ron-lach-8387837_ph8ssc.jpg',
    'https://res.cloudinary.com/dv30hn53t/image/upload/v1777972930/pexels-cup-of-couple-6956903_rmsgdx.jpg',
    'https://res.cloudinary.com/dv30hn53t/image/upload/v1777972929/pexels-silverkblack-36730379_ibmwfz.jpg'
]

const Intro = () => {
    const { siteData } = useContext(Context)
    const [currentIndex, setCurrentIndex] = useState(0)

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
        }, 3000)
        return () => clearInterval(timer)
    }, [])

    return (
        <div className='w-full h-auto flex flex-col items-center justify-center gap-4 md:gap-12'>

            <div className='w-full overflow-hidden '>
                <Image
                    src={images[currentIndex]}
                    height={1000}
                    className='object-cover w-full aspect-video md:aspect-16/5 overflow-hidden shadow-lg'
                    alt='Fashion Showcase'
                    width={1000}
                />

                <div className='absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10'>
                    {images.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1 rounded-full transition-all duration-500 ${i === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/40'}`}
                        />
                    ))}
                </div>
            </div>

            <div className='w-full flex flex-col items-center justify-center gap-2 p-10'>
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className='w-full flex flex-col items-center justify-center'
                >
                    <div className='inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest text-primary mb-6 shadow-sm'>
                        <RefreshCw size={12} className='animate-spin' />
                        Updated Collection 2026
                    </div>
                    <h2 className='text-4xl flex gap-4  md:text-6xl lg:text-7xl font-black text-slate-900 leading-[0.9] tracking-tighter mb-6'>
                        STYLE <br />
                        <span className='text-primary underline underline-offset-8 decoration-primary/20'>EVOLVED.</span>
                    </h2>
                    <p className='text-base md:text-lg text-slate-500 font-medium leading-relaxed max-w-md mx-auto lg:mx-0'>
                        Experience the flawless fusion of premium aesthetics and daily utility. {siteData?.website_name || 'NIJAM'} defines the next generation.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className='w-full flex items-center justify-center md:gap-10 flex-col gap-4 md:flex-row'
                >
                    <Link href='/products' className='w-full sm:w-auto group px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-3 hover:bg-primary transition-all active:scale-95'>
                        Shop Now
                        <ArrowRight size={18} className='group-hover:translate-x-1 transition-transform' />
                    </Link>
                    <Link href='/offers' className='w-full sm:w-auto px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all active:scale-95 text-center'>
                        View Offers
                    </Link>
                </motion.div>
            </div>

        </div>
    )
}

export default Intro