import RegisterForm from '@/components/forms/RegisterForm'
import React from 'react'
import { UserPlus, ShoppingBag } from 'lucide-react'

const RegisterPageUser = () => {
    return (
        <div className='w-full min-h-[90vh] flex items-center justify-center p-4 bg-slate-50/50 pt-20'>
            <div className='max-w-4xl w-full bg-white rounded-2xl shadow-xl shadow-slate-200/30 border border-slate-100 flex flex-col md:flex-row overflow-hidden'>
                {/* Left Side: Branding */}
                <div className='w-full md:w-1/2 bg-slate-900 p-8 md:p-12 flex flex-col justify-between text-white relative overflow-hidden'>
                    <div className='absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2'></div>
                    <div className='absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2'></div>
                    
                    <div className='relative z-10'>
                        <div className='w-10 h-10 rounded-xl bg-primary flex items-center justify-center mb-6'>
                            <ShoppingBag size={20} />
                        </div>
                        <h1 className='text-3xl font-black tracking-tight leading-none mb-3'>
                            Create your <span className='text-primary'>Account.</span>
                        </h1>
                        <p className='text-slate-400 text-sm font-medium'>
                            Join us today to enjoy personalized shopping, track your orders, and stay updated on the latest arrivals.
                        </p>
                    </div>

                    <div className='relative z-10 mt-8 md:mt-0'>
                        <p className='text-[9px] font-black uppercase tracking-widest text-slate-500'>Secure Registration Process</p>
                    </div>
                </div>

                {/* Right Side: Form */}
                <div className='w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center gap-6'>
                    <div className='flex flex-col gap-1.5'>
                        <h2 className='text-xl font-bold text-slate-800 flex items-center gap-2'>
                            Join Us
                            <div className='h-1 w-10 bg-primary rounded-full'></div>
                        </h2>
                        <p className='text-slate-400 text-xs font-medium'>Complete the form below to get started.</p>
                    </div>
                    <RegisterForm />
                </div>
            </div>
        </div>
    )
}

export default RegisterPageUser
