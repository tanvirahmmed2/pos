'use client'
import axios from 'axios'
import { motion } from 'framer-motion'
import Link from 'next/link'
import React, { useState } from 'react'
import { toast } from 'react-hot-toast'
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react'

const UserLoginForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const loginHandle = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const response = await axios.post('/api/user/login', formData, { withCredentials: true })
      toast.success(response.data.message)
      const user = response.data.payload
      if (user.role === 'admin' || user.role === 'manager' || user.role === 'sales') {
        window.location.replace('/dashboard')
      } else {
        window.location.replace('/profile')
      }
    } catch (error) {
      console.log(error)
      toast.error(error?.response?.data?.message || 'Failed to login')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.form 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.4 }} 
      onSubmit={loginHandle} 
      className='w-full flex flex-col gap-4 min-w-[300px]'
    >
      <div className='flex flex-col gap-1.5'>
        <label htmlFor="email" className='text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1'>Email Address</label>
        <div className='relative'>
          <Mail className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400' size={16} />
          <input 
            type="email" id='email' name='email' required 
            value={formData.email} onChange={handleChange} 
            placeholder="name@example.com"
            className='w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-primary transition-all font-medium text-slate-700 text-sm' 
          />
        </div>
      </div>

      <div className='flex flex-col gap-1.5'>
        <label htmlFor="password" className='text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1'>Password</label>
        <div className='relative'>
          <Lock className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400' size={16} />
          <input 
            type="password" id='password' name='password' required 
            value={formData.password} onChange={handleChange} 
            placeholder="••••••••"
            className='w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-primary transition-all font-medium text-slate-700 text-sm' 
          />
        </div>
      </div>

      <div className='flex items-center justify-between px-1'>
        <Link href="/recoverid" className='text-[11px] font-bold text-slate-400 hover:text-primary transition-colors'>
          Forgot password?
        </Link>
      </div>

      <button 
        type='submit' 
        disabled={isSubmitting}
        className='group flex items-center justify-center gap-2.5 w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold text-base hover:bg-primary transition-all active:scale-[0.98] disabled:opacity-50 shadow-md'
      >
        {isSubmitting ? (
          <Loader2 size={20} className='animate-spin' />
        ) : (
          <>
            Sign In
            <ArrowRight size={18} className='group-hover:translate-x-1 transition-transform' />
          </>
        )}
      </button>
    </motion.form>
  )
}

export default UserLoginForm
