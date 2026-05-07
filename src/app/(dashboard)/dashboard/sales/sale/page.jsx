'use client'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { TrendingUp, Package, BarChart3 } from 'lucide-react'

const SalesReport = () => {
    const [reportData, setReportData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const res = await axios.get('/api/report/sales', { withCredentials: true })
                setReportData(res.data.payload)
            } catch (error) {
                console.error("Report error", error)
            } finally {
                setLoading(false)
            }
        }
        fetchReport()
    }, [])

    if (loading) return <div className='w-full min-h-screen flex items-center justify-center font-medium text-sky-400 uppercase tracking-widest text-xs'>Analyzing Sales Data...</div>

    return (
        <div className='w-full max-w-7xl mx-auto p-4 md:p-6 flex flex-col gap-8'>
            <div className='flex flex-col gap-2'>
                <h1 className='text-3xl font-bold text-slate-800 tracking-tight'>Sales Performance</h1>
                <p className='text-slate-400 text-sm font-medium uppercase tracking-widest'>Business Analytics & Revenue</p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='p-6 bg-white border border-slate-100 rounded-2xl shadow-sm flex flex-col gap-4'>
                    <div className='w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center text-sky-500'>
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <span className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>Total Revenue</span>
                        <p className='text-4xl font-black text-slate-900 tracking-tighter mt-1'>
                            <span className='text-xl text-slate-400 mr-1'>৳</span>
                            {parseFloat(reportData?.stats?.total_revenue || 0).toLocaleString()}
                        </p>
                    </div>
                </div>

                <div className='p-6 bg-white border border-slate-100 rounded-2xl shadow-sm flex flex-col gap-4'>
                    <div className='w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600'>
                        <Package size={24} />
                    </div>
                    <div>
                        <span className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>Total Items Sold</span>
                        <p className='text-4xl font-black text-slate-900 tracking-tighter mt-1'>
                            {Number(reportData?.stats?.total_items_sold || 0).toLocaleString()} <span className='text-sm font-bold text-slate-300 uppercase'>Units</span>
                        </p>
                    </div>
                </div>
            </div>

            <div className='w-full flex flex-col gap-6'>
                <div className='flex items-center gap-3'>
                    <div className='p-2 bg-slate-50 rounded-lg text-slate-500'>
                        <BarChart3 size={20} />
                    </div>
                    <h2 className='text-xl font-bold text-slate-800 tracking-tight'>Top 10 Selling Items</h2>
                </div>

                <div className='bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden'>
                    <div className='w-full overflow-x-auto'>
                        <table className='w-full text-left min-w-[600px]'>
                            <thead>
                                <tr className='bg-slate-50/50 border-b border-slate-100'>
                                    <th className='px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400'>Product Name</th>
                                    <th className='px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center'>Quantity Sold</th>
                                    <th className='px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right'>Generated Revenue</th>
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-slate-50'>
                                {reportData?.topProducts?.map((item, idx) => (
                                    <tr key={idx} className='hover:bg-slate-50/50 transition-colors group'>
                                        <td className='px-6 py-4'>
                                            <div className='flex items-center gap-3'>
                                                <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${idx < 3 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                                                    {idx + 1}
                                                </span>
                                                <p className='font-bold text-slate-700'>{item.name}</p>
                                            </div>
                                        </td>
                                        <td className='px-6 py-4 text-center'>
                                            <span className='px-3 py-1 bg-sky-50 text-sky-600 rounded-lg text-sm font-bold'>
                                                {item.sold_qty}
                                            </span>
                                        </td>
                                        <td className='px-6 py-4 text-right'>
                                            <span className='font-bold text-emerald-600'>
                                                ৳{parseFloat(item.revenue || 0).toLocaleString()}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SalesReport
