'use client'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { User, Mail, Phone, Calendar, ShoppingBag, Settings, LogOut, Loader2, Shield } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { MdReviews } from 'react-icons/md'

const ProfilePage = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get('/api/user/islogin', { withCredentials: true })
        if (res.data.success) {
          setUser(res.data.payload)
        } else {
          toast.error('Failed to load profile')
        }
      } catch {
        toast.error('Session expired. Please login again.')
        window.location.replace('/login')
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [])

  const handleLogout = async () => {
    try {
      await axios.get('/api/user/login', { withCredentials: true })
      toast.success('Logged out successfully')
      window.location.replace('/login')
    } catch {
      toast.error('Logout failed')
    }
  }

  if (loading) {
    return (
      <div className='w-full min-h-screen flex items-center justify-center bg-slate-50/50'>
        <div className='flex flex-col items-center gap-3'>
          <Loader2 className='animate-spin text-slate-400' size={32} />
          <p className='text-slate-400 text-xs font-bold uppercase tracking-widest'>Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className='w-full min-h-screen bg-slate-50/50 pt-20 pb-12 px-4'>
      <div className='max-w-3xl mx-auto flex flex-col gap-6'>

        {/* ── Page Title ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className='flex items-center gap-3'
        >
          <Shield size={22} className='text-slate-400' />
          <div>
            <h1 className='text-2xl font-black text-slate-900 tracking-tight'>My Profile</h1>
            <p className='text-slate-400 text-xs font-medium mt-0.5'>Your personal account information</p>
          </div>
        </motion.div>

        {/* ── Profile Card ───────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className='bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden'
        >
          {/* Card Header / Banner */}
          <div className='h-24 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 relative'>
            <div className='absolute -bottom-8 left-6'>
              <div className='w-16 h-16 rounded-2xl bg-gradient-to-tr from-slate-600 to-slate-900 border-4 border-white flex items-center justify-center text-white text-2xl font-black shadow-lg'>
                {user.name?.charAt(0)?.toUpperCase()}
              </div>
            </div>
          </div>

          {/* Name + Action */}
          <div className='pt-12 px-6 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
            <div>
              <h2 className='text-xl font-black text-slate-900'>{user.name}</h2>
              <p className='text-slate-400 text-sm font-medium'>Registered User</p>
            </div>
            <button
              onClick={handleLogout}
              className='self-start sm:self-auto flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-800 rounded-xl font-bold text-sm hover:bg-slate-800 hover:text-white transition-all active:scale-95 border border-slate-100'
            >
              <LogOut size={15} />
              Logout
            </button>
          </div>

          {/* Info Grid */}
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-px bg-slate-100 border-t border-slate-100'>
            <InfoCell icon={<Mail size={16} className='text-slate-400' />} label='Email Address' value={user.email} />
            <InfoCell icon={<Phone size={16} className='text-slate-400' />} label='Phone Number' value={user.phone} />
            <InfoCell icon={<User size={16} className='text-slate-400' />} label='Full Name' value={user.name} />
            <InfoCell
              icon={<Calendar size={16} className='text-slate-400' />}
              label='Member Since'
              value={new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            />
          </div>
        </motion.div>

        {/* ── Quick Links ────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className='grid grid-cols-1 sm:grid-cols-2 gap-4'
        >
          <QuickLink
            href='/user/orders'
            icon={<ShoppingBag size={20} />}
            label='My Orders'
            desc='View all your purchases and order history'
            color='from-slate-800 to-slate-900'
          />
          <QuickLink
            href='/user/reviews'
            icon={<MdReviews size={20} />}
            label='Reviews'
            desc='Update your name, email, phone, or password'
            color='from-slate-900 to-black'
          />
          <QuickLink
            href='/user/settings'
            icon={<Settings size={20} />}
            label='Settings'
            desc='Update your name, email, phone, or password'
            color='from-slate-600 to-slate-800'
          />
        </motion.div>

      </div>
    </div>
  )
}

// ── Info Cell ─────────────────────────────────────────────────────────────────
const InfoCell = ({ icon, label, value }) => (
  <div className='bg-white px-6 py-4 flex items-center gap-4'>
    <div className='w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0'>
      {icon}
    </div>
    <div>
      <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5'>{label}</p>
      <p className='text-sm font-bold text-slate-800 truncate'>{value || '—'}</p>
    </div>
  </div>
)

// ── Quick Link Card ───────────────────────────────────────────────────────────
const QuickLink = ({ href, icon, label, desc, color }) => (
  <Link href={href}>
    <div className={`group relative bg-gradient-to-br ${color} rounded-2xl p-5 text-white overflow-hidden cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200 active:scale-[0.98]`}>
      <div className='absolute inset-0 opacity-0 group-hover:opacity-10 bg-white transition-opacity' />
      <div className='flex items-start gap-4'>
        <div className='w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0'>
          {icon}
        </div>
        <div>
          <h3 className='font-black text-base leading-tight'>{label}</h3>
          <p className='text-white/70 text-xs mt-1 font-medium'>{desc}</p>
        </div>
      </div>
      <div className='absolute right-4 bottom-4 opacity-20 text-5xl font-black select-none'>→</div>
    </div>
  </Link>
)

export default ProfilePage
