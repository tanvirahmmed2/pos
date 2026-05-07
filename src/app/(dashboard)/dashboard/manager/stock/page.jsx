'use client'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Box, TrendingUp } from 'lucide-react'

const StockReport = () => {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [viewMode, setViewMode] = useState('low')

    useEffect(() => {
        const fetchStockData = async () => {
            try {
                const res = await axios.get('/api/report/stock', { withCredentials: true })
                setData(res.data.payload)
            } catch (error) {
                console.error("Stock fetch error", error)
            } finally {
                setLoading(false)
            }
        }
        fetchStockData()
    }, [])

    if (loading) return <div className='w-full min-h-screen flex items-center justify-center font-medium text-sky-400 uppercase tracking-widest text-xs'>Analyzing Inventory...</div>

    const currentList = viewMode === 'low' ? data?.lowStock : data?.highStock

    return (
        <div className='w-full flex flex-col gap-10 bg-white'>

            <div className='flex flex-col gap-2'>
                <h1 className='text-3xl font-bold text-slate-800 tracking-tight'>Inventory Analysis</h1>
                <p className='text-slate-400 text-sm font-medium uppercase tracking-widest'>Stock Management & Forecast</p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                <div className='p-6 bg-white border border-slate-100 rounded-2xl shadow-sm flex flex-col gap-4'>
                    <div className='w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary'>
                        <Box size={24} />
                    </div>
                    <div>
                        <span className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>Remaining Stock</span>
                        <p className='text-3xl font-black text-slate-900 tracking-tighter mt-1'>
                            {data?.stats?.total_remaining_stock ? Number(data.stats.total_remaining_stock).toLocaleString() : 0} <span className='text-sm font-bold text-slate-300 uppercase'>Units</span>
                        </p>
                    </div>
                </div>

                <div className='p-6 bg-white border border-slate-100 rounded-2xl shadow-sm flex flex-col gap-4'>
                    <div className='w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600'>
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <span className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>Lifetime Sales Volume</span>
                        <p className='text-3xl font-black text-slate-900 tracking-tighter mt-1'>
                            {data?.stats?.total_sold_stock ? Number(data.stats.total_sold_stock).toLocaleString() : 0} <span className='text-sm font-bold text-slate-300 uppercase'>Units</span>
                        </p>
                    </div>
                </div>
            </div>

            <div className='w-full flex flex-col gap-6'>
                <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
                    <div className='flex items-center gap-3'>
                        <h2 className='text-xl font-bold text-slate-800 tracking-tight capitalize'>{viewMode} Stock Inventory</h2>
                        <span className='bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-1 rounded uppercase'>{currentList?.length || 0} Items</span>
                    </div>

                    <div className='flex bg-slate-100 p-1 rounded-xl w-fit'>
                        <button
                            onClick={() => setViewMode('low')}
                            className={`px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${viewMode === 'low' ? 'bg-white text-rose-500 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Low Stock
                        </button>
                        <button
                            onClick={() => setViewMode('high')}
                            className={`px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${viewMode === 'high' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            High Stock
                        </button>
                    </div>
                </div>

                <div className='bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden'>
                    <table className='w-full text-left'>
                        <thead>
                            <tr className='bg-slate-50/50 border-b border-slate-100'>
                                <th className='px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400'>Product Details</th>
                                <th className='px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400'>Unit Price</th>
                                <th className='px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right'>Current Qty</th>
                            </tr>
                        </thead>
                        <tbody className='divide-y divide-slate-50'>
                            {currentList?.map((item, idx) => (
                                <tr key={idx} className='hover:bg-slate-50/50 transition-colors group'>
                                    <td className='px-6 py-4'>
                                        <p className='text-sm font-bold text-slate-700'>{item.name}</p>
                                        <p className='text-[10px] text-slate-400 uppercase font-bold'>{item.category_name || 'General'}</p>
                                    </td>
                                    <td className='px-6 py-4 text-sm font-bold text-slate-900'>৳{item.sale_price}</td>
                                    <td className='px-6 py-4 text-right'>
                                        <span className={`px-3 py-1 rounded-lg text-xs font-bold ${viewMode === 'low' && item.stock < 10 ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-600'}`}>
                                            {item.stock}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default StockReport
