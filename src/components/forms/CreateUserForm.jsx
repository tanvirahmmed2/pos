'use client'
import axios from 'axios'
import React, { useState } from 'react'
import { toast } from 'react-hot-toast'
import { RiCloseLine, RiUserAddLine, RiShieldUserLine, RiMailLine, RiPhoneLine, RiLockLine, RiUserLine } from 'react-icons/ri'

const CreateUserForm = ({ onSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'sales'
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const changeHandler = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const submitCreateUser = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            const response = await axios.post('/api/user', formData, { withCredentials: true })
            toast.success(response.data.message)
            if (onSuccess) onSuccess()
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to create user")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={submitCreateUser} className='flex flex-col w-full bg-white'>
            {/* Header */}
            <div className='flex items-center justify-between p-6 border-b border-slate-100'>
                <div className='flex items-center gap-2'>
                    <RiUserAddLine className='text-emerald-500' size={24} />
                    <h2 className='text-lg font-bold text-slate-800 tracking-tight'>Create New Account</h2>
                </div>
                <button 
                    type='button' 
                    onClick={onCancel} 
                    className='p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors'
                >
                    <RiCloseLine size={24} />
                </button>
            </div>

            {/* Body */}
            <div className='p-6 flex flex-col gap-4 max-h-[70vh] overflow-y-auto'>
                <div className='flex flex-col gap-1.5'>
                    <label htmlFor="name" className='text-xs font-bold text-slate-500 uppercase tracking-wider ml-1'>Full Name</label>
                    <div className='relative'>
                        <RiUserLine className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400' />
                        <input 
                            type="text" name='name' id='name' required 
                            placeholder="John Doe"
                            value={formData.name} onChange={changeHandler} 
                            className='w-full border border-slate-200 pl-11 pr-4 py-3 rounded-xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all text-sm font-medium text-slate-800' 
                        />
                    </div>
                </div>

                <div className='flex flex-col gap-1.5'>
                    <label htmlFor="email" className='text-xs font-bold text-slate-500 uppercase tracking-wider ml-1'>Email Address</label>
                    <div className='relative'>
                        <RiMailLine className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400' />
                        <input 
                            type="email" name='email' id='email' required 
                            placeholder="user@example.com"
                            value={formData.email} onChange={changeHandler} 
                            className='w-full border border-slate-200 pl-11 pr-4 py-3 rounded-xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all text-sm font-medium text-slate-800' 
                        />
                    </div>
                </div>

                <div className='flex flex-col gap-1.5'>
                    <label htmlFor="phone" className='text-xs font-bold text-slate-500 uppercase tracking-wider ml-1'>Phone Number</label>
                    <div className='relative'>
                        <RiPhoneLine className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400' />
                        <input 
                            type="text" name='phone' id='phone' required 
                            placeholder="+880 1XXX XXXXXX"
                            value={formData.phone} onChange={changeHandler} 
                            className='w-full border border-slate-200 pl-11 pr-4 py-3 rounded-xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all text-sm font-medium text-slate-800' 
                        />
                    </div>
                </div>

                <div className='flex flex-col gap-1.5'>
                    <label htmlFor="password" className='text-xs font-bold text-slate-500 uppercase tracking-wider ml-1'>Password</label>
                    <div className='relative'>
                        <RiLockLine className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400' />
                        <input 
                            type="password" name='password' id='password' required 
                            placeholder="••••••••"
                            value={formData.password} onChange={changeHandler} 
                            className='w-full border border-slate-200 pl-11 pr-4 py-3 rounded-xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all text-sm font-medium text-slate-800' 
                        />
                    </div>
                </div>

                <div className='flex flex-col gap-1.5'>
                    <label htmlFor="role" className='text-xs font-bold text-slate-500 uppercase tracking-wider ml-1'>Assign Role</label>
                    <div className='relative'>
                        <RiShieldUserLine className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400' />
                        <select 
                            name="role" id="role" required 
                            value={formData.role} onChange={changeHandler} 
                            className='w-full border border-slate-200 pl-11 pr-4 py-3 rounded-xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all text-sm font-medium text-slate-800 bg-white'
                        >
                            <option value="sales">Sales (POS & Orders)</option>
                            <option value="manager">Manager (Inventory & Support)</option>
                            <option value="admin">Admin (Full Access)</option>
                            <option value="user">User (Standard Customer)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className='p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3'>
                <button 
                    type='button' 
                    onClick={onCancel}
                    className='px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200 bg-slate-200 rounded-xl transition-colors'
                >
                    Cancel
                </button>
                <button 
                    disabled={isSubmitting}
                    type='submit' 
                    className='px-8 py-2.5 text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-colors shadow-lg shadow-emerald-200 disabled:opacity-50'
                >
                    {isSubmitting ? 'Creating...' : 'Create Account'}
                </button>
            </div>
        </form>
    )
}

export default CreateUserForm
