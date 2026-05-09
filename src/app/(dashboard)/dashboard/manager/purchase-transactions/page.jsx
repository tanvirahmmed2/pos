'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { FaSearch, FaFileInvoiceDollar, FaCalendarAlt, FaBoxOpen } from 'react-icons/fa'

const PurchasePaymentsPage = () => {
    const [payments, setPayments] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(true)

    const fetchPayments = async () => {
        try {
            const res = await axios.get(`/api/purchase-payment?q=${searchTerm}`, { withCredentials: true })
            if (res.data.success) {
                setPayments(res.data.payload)
            }
        } catch (error) {
            setPayments([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const delayDebounce = setTimeout(() => fetchPayments(), 300)
        return () => clearTimeout(delayDebounce)
    }, [searchTerm])

    return (
        <div className='w-full min-h-screen flex flex-col items-center p-1 sm:p-4 gap-6 bg-slate-50'>
            <div className='flex items-center gap-3'>
                <FaFileInvoiceDollar className='text-3xl text-slate-900' />
                <h1 className='text-3xl font-black text-slate-800 uppercase tracking-tighter'>Purchase Payments</h1>
            </div>

            {/* Search Bar */}
            <div className='w-full  flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-2xl shadow-sm'>
                <FaSearch className='text-slate-400' />
                <input
                    type="text"
                    placeholder="Search by supplier or invoice..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='w-full outline-none p-2 text-slate-700 bg-transparent'
                />
            </div>

            <div className='w-full  flex flex-col gap-3'>
                {loading ? (
                    <p className='text-center py-10 text-slate-400 font-bold animate-pulse'>Loading Records...</p>
                ) : payments.length > 0 ? (
                    payments.map((p) => (
                        <div
                            key={p.payment_id}
                            className='w-full flex flex-col md:flex-row justify-between p-5 rounded-2xl border border-white shadow-sm bg-white hover:shadow-md transition-all'
                        >
                            <div className='flex flex-col gap-1'>
                                <p className='text-[10px] font-black text-slate-800 uppercase tracking-widest'>Supplier</p>
                                <p className='font-black text-slate-900 text-lg leading-tight'>{p.supplier_name}</p>
                                <div className='flex gap-4 mt-2'>
                                    <span className='text-xs font-bold text-slate-500 flex items-center gap-1'>
                                        <FaBoxOpen className='text-slate-400' /> {p.total_products} Products
                                    </span>
                                    <span className='text-xs font-bold text-slate-400'>INV: {p.invoice_no || 'N/A'}</span>
                                </div>
                            </div>

                            <div className='flex flex-col md:items-end gap-1 mt-4 md:mt-0 border-t md:border-t-0 pt-3 md:pt-0'>
                                <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>Financials</p>
                                <div className='flex items-center gap-2'>
                                    <span className='text-xs text-slate-400'>Paid:</span>
                                    <span className='text-xl font-black text-slate-900 tracking-tighter'>৳{Number(p.paid_amount).toLocaleString()}</span>
                                </div>
                                <p className='text-xs text-slate-400 font-medium'>
                                    via <span className='font-bold text-slate-600 uppercase'>{p.payment_method}</span>
                                </p>
                                <p className='text-[10px] text-slate-400 mt-1 font-bold flex items-center gap-1'>
                                    <FaCalendarAlt /> {new Date(p.date).toLocaleString().slice(0, 17)}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className='text-center py-20 text-slate-400 font-medium'>No payment history found matching your search.</p>
                )}
            </div>
        </div>
    )
}

export default PurchasePaymentsPage
