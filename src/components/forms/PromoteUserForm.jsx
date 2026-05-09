'use client'
import axios from 'axios'
import React, { useState } from 'react'
import { toast } from 'react-hot-toast'
import { RiCloseLine, RiSearchLine, RiShieldUserLine } from 'react-icons/ri'

const PromoteUserForm = ({ onSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        email: '',
        role: ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const changeHandler = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const submitPromotion = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            const response = await axios.patch('/api/user', formData, { withCredentials: true })
            toast.success(response.data.message)
            if (onSuccess) onSuccess()
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to promote user")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={submitPromotion} className='flex flex-col w-full bg-white'>
            {/* Header */}
            <div className='flex items-center justify-between p-6 border-b border-slate-100'>
                <div className='flex items-center gap-2'>
                    <RiShieldUserLine className='text-slate-800' size={24} />
                    <h2 className='text-lg font-bold text-slate-800 tracking-tight'>Promote User Role</h2>
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
            <div className='p-6 flex flex-col gap-6'>
                <p className='text-sm text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-100'>
                    Enter the email address of an existing user to change their role. Users must already have an account in your store.
                </p>

                <div className='flex flex-col gap-1.5'>
                    <label htmlFor="email" className='text-xs font-bold text-slate-500 uppercase tracking-wider ml-1'>User Email</label>
                    <div className='relative'>
                        <RiSearchLine className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400' />
                        <input 
                            type="email" name='email' id='email' required 
                            placeholder="user@example.com"
                            value={formData.email} onChange={changeHandler} 
                            className='w-full border border-slate-200 pl-11 pr-4 py-3 rounded-xl outline-none focus:border-slate-800 focus:ring-4 focus:ring-slate-800/10 transition-all text-sm font-medium text-slate-800' 
                        />
                    </div>
                </div>

                <div className='flex flex-col gap-1.5'>
                    <label htmlFor="role" className='text-xs font-bold text-slate-500 uppercase tracking-wider ml-1'>Assign Role</label>
                    <select 
                        name="role" id="role" required 
                        value={formData.role} onChange={changeHandler} 
                        className='w-full border border-slate-200 px-4 py-3 rounded-xl outline-none focus:border-slate-800 focus:ring-4 focus:ring-slate-800/10 transition-all text-sm font-medium text-slate-800 bg-white'
                    >
                        <option value="">Select Role</option>
                        <option value="admin">Admin (Full Access)</option>
                        <option value="manager">Manager (Inventory & Support)</option>
                        <option value="sales">Sales (POS & Orders)</option>
                        <option value="user">User (Standard Customer)</option>
                    </select>
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
                    className='px-8 py-2.5 text-sm font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-xl transition-colors shadow-lg shadow-slate-200 disabled:opacity-50'
                >
                    {isSubmitting ? 'Processing...' : 'Update Role'}
                </button>
            </div>
        </form>
    )
}

export default PromoteUserForm
