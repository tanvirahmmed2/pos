'use client'
import React, { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'

const ForgetPasswordPage = () => {
    const router = useRouter()
    const [view, setView] = useState('request') // 'request' or 'reset'
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [otp, setOtp] = useState('')
    const [newPassword, setNewPassword] = useState('')

    const handleRequestOTP = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await axios.post('/api/user/forgetpassword', { email })
            if (res.data.success) {
                toast.success("OTP Dispatched")
                setView('reset')
            }
        } catch (err) { toast.error(err.response?.data?.message || "Error") }
        finally { setLoading(false) }
    }

    const handleFinalReset = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await axios.post('/api/user/forgetpassword/reset', { email, otp, newPassword })
            if (res.data.success) {
                toast.success("Password Updated")
                router.push('/login')
            }
        } catch (err) { toast.error(err.response?.data?.message || "Error") }
        finally { setLoading(false) }
    }

    return (
        <div className='min-h-screen bg-white flex items-center justify-center p-8 font-sans'>
            <div className='max-w-md w-full border-t-8  p-10 shadow-2xl rounded-sm bg-white'>
                
                <div className='mb-10'>
                    <h1 className='text-2xl  uppercase '>
                        {view === 'request' ? 'Password Recovery' : 'Identity Verified'}
                    </h1>
                    <p className='text-[10px] font-bold text-orange-400 uppercase tracking-widest mt-2'>
                        {view === 'request' ? 'System Access Restoration' : 'Enter Received Credentials'}
                    </p>
                </div>

                {view === 'request' ? (
                    <form onSubmit={handleRequestOTP} className='flex flex-col gap-6'>
                        <div className='flex flex-col gap-2'>
                            <label className='text-[10px]  text-orange-400 uppercase tracking-widest'>Email Registry</label>
                            <input 
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className='w-full border-b-2 border-orange-100 py-3 outline-none focus: transition-all text-lg font-medium'
                                placeholder="email"
                            />
                        </div>
                        <button 
                            disabled={loading}
                            className='w-full bg-orange-600 text-white py-4  uppercase tracking-[0.2em] text-xs hover:bg-orange-800 transition-all disabled:opacity-50'
                        >
                            {loading ? 'Transmitting...' : 'Request OTP Code'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleFinalReset} className='flex flex-col gap-6'>
                        <div className='flex flex-col gap-2'>
                            <label className='text-[10px]  text-orange-400 uppercase tracking-widest'>One-Time Code</label>
                            <input 
                                type="text"
                                maxLength="6"
                                required
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className='w-full border-b-2 border-orange-100 py-3 outline-none focus: transition-all text-center text-3xl  tracking-[0.4em]'
                            />
                        </div>
                        <div className='flex flex-col gap-2'>
                            <label className='text-[10px]  text-orange-400 uppercase tracking-widest'>New Secure Password</label>
                            <input 
                                type="password"
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className='w-full border-b-2 border-orange-100 py-3 outline-none focus: transition-all'
                            />
                        </div>
                        <button 
                            disabled={loading}
                            className='w-full bg-orange-600 text-white py-4  uppercase tracking-[0.2em] text-xs hover:bg-emerald-600 transition-all'
                        >
                            {loading ? 'Updating...' : 'Set New Password'}
                        </button>
                        <button 
                            type="button"
                            onClick={() => setView('request')}
                            className='text-[10px] font-bold text-orange-300 uppercase hover:text-orange-600 text-center'
                        >
                            Resend Code
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}

export default ForgetPasswordPage
