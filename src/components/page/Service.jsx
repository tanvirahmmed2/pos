'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { Truck, BadgeCheck, RefreshCw, Headphones } from 'lucide-react'

const data = [
  {
    id: 1,
    icon: <Truck size={26} />,
    title: 'Home Delivery',
    description: 'Free on ৳2000+',
    bg: '#EFF6FF',
    color: '#2563EB',
  },
  {
    id: 2,
    icon: <BadgeCheck size={26} />,
    title: '100% Original',
    description: 'Authentic guarantee',
    bg: '#F0FDF4',
    color: '#16A34A',
  },
  {
    id: 3,
    icon: <RefreshCw size={26} />,
    title: '7 Days Return',
    description: 'Easy return policy',
    bg: '#FFF7ED',
    color: '#EA580C',
  },
  {
    id: 4,
    icon: <Headphones size={26} />,
    title: '24/7 Support',
    description: 'Always here to help',
    bg: '#F5F3FF',
    color: '#7C3AED',
  },
]

const Service = () => {
  return (
    <section className="w-full py-10 px-4 md:px-10 lg:px-20 bg-white">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {data.map((d) => (
          <motion.div
            key={d.id}
            variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center gap-3 p-5 rounded-2xl border border-gray-100 hover:shadow-md transition-all duration-200"
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: d.bg, color: d.color }}
            >
              {d.icon}
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800">{d.title}</h3>
              <p className="text-[12px] text-gray-400 mt-0.5">{d.description}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}

export default Service
