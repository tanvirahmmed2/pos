'use client'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Line } from 'react-chartjs-2'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const AnalyticsPage = () => {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await axios.get('/api/report/analytics')
                setData(res.data.payload)
            } catch (err) { console.log(err) }
            finally { setLoading(false) }
        }
        fetchAnalytics()
    }, [])

    if (loading) return <div className='p-10 text-center text-sky-400 animate-pulse font-black uppercase tracking-widest'>Analyzing Business Logic...</div>

    // Advanced: Calculate Trend Percentage
    const calculateTrend = (current, previous) => {
        if (!previous || previous === 0) return 0;
        return (((current - previous) / previous) * 100).toFixed(1);
    }

    const todayTrend = calculateTrend(data?.sales?.today, data?.sales?.yesterday);

    const chartConfig = {
        labels: data?.chartData?.map(d => d.date) || [],
        datasets: [
            {
                label: 'Revenue',
                data: data?.chartData?.map(d => Number(d.amount)) || [],
                borderColor: '#0ea5e9',
                backgroundColor: 'rgba(14, 165, 233, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 8,
                borderWidth: 3
            },
            {
                label: 'Procurement',
                data: data?.chartData?.map(d => Number(d.purchase_amount)) || [],
                borderColor: '#cbd5e1',
                borderDash: [5, 5],
                fill: false,
                tension: 0.4,
                pointRadius: 0
            }
        ]
    }

    const formatNum = (val) => Number(val || 0).toLocaleString();

    return (
        <div className='mx-auto w-full p-1 sm:p-4 flex flex-col gap-8 bg-white min-h-screen'>
            <div className='flex justify-between items-end'>
                <div className='flex flex-col gap-1'>
                    <h1 className='text-3xl font-black text-sky-900 tracking-tighter'>Business Analytics</h1>
                    <p className='text-sky-400 text-sm font-medium tracking-widest uppercase'>Intelligence & Capital Flow</p>
                </div>
                <div className='text-right'>
                    <span className='text-[10px] font-bold text-gray-400 uppercase'>Data Refresh</span>
                    <p className='text-xs font-bold text-sky-600'>{new Date().toLocaleTimeString()}</p>
                </div>
            </div>

            {/* Sales Grid with Trends */}
            <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
                {[
                    { label: 'Today', val: data?.sales?.today, trend: todayTrend },
                    { label: 'Yesterday', val: data?.sales?.yesterday },
                    { label: 'Last 7 Days', val: data?.sales?.last_week },
                    { label: 'This Year', val: data?.sales?.last_year },
                ].map((s, i) => (
                    <div key={i} className='p-6 bg-sky-50 rounded-2xl border border-sky-100 relative overflow-hidden group'>
                        <span className='text-[10px] font-bold text-sky-400 uppercase tracking-widest'>{s.label}</span>
                        <div className='flex items-baseline gap-2'>
                            <p className='text-xl font-black text-sky-800 mt-1'>৳{formatNum(s.val)}</p>
                            {s.trend !== undefined && (
                                <span className={`text-[10px] font-bold ${s.trend >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {s.trend >= 0 ? '↑' : '↓'} {Math.abs(s.trend)}%
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Finance Cards with Contextual Info */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                <div className='p-8 bg-sky-600 rounded-2xl text-white shadow-xl shadow-sky-100 relative'>
                    <span className='text-xs font-bold opacity-80 uppercase tracking-wider'>Total Procurement</span>
                    <p className='text-3xl font-black mt-2'>৳{formatNum(data?.finance?.total_invested)}</p>
                    <div className='mt-4 h-1 w-full bg-white/20 rounded-full overflow-hidden'>
                        <div className='h-full bg-white w-2/3'></div>
                    </div>
                </div>
                <div className='p-8 bg-emerald-600 rounded-2xl text-white shadow-xl shadow-emerald-100'>
                    <span className='text-xs font-bold opacity-80 uppercase tracking-wider'>Net Cash Flow</span>
                    <p className='text-3xl font-black mt-2'>৳{formatNum(data?.finance?.net_cash)}</p>
                    <p className='text-[10px] mt-2 opacity-70 font-medium'>Liquidity after purchase settlements</p>
                </div>
                <div className='p-8 bg-sky-900 rounded-2xl text-white shadow-xl shadow-sky-200'>
                    <span className='text-xs font-bold opacity-80 uppercase tracking-wider'>Stock Asset Valuation</span>
                    <p className='text-3xl font-black mt-2'>৳{formatNum(data?.finance?.current_stock_value)}</p>
                    <p className='text-[10px] mt-2 opacity-70 font-medium'>Calculated at current purchase price</p>
                </div>
            </div>

            {/* Performance Chart */}
            <div className='w-full p-8 border border-sky-100 rounded-3xl bg-white shadow-sm'>
                <div className='flex justify-between items-center mb-8'>
                    <div>
                        <h3 className='text-lg font-bold text-sky-800'>Revenue vs. Procurement</h3>
                        <p className='text-xs text-gray-400'>Last 7 days performance window</p>
                    </div>
                    <div className='flex gap-4 text-[10px] font-black uppercase tracking-tighter'>
                        <div className='flex items-center gap-1.5'>
                            <span className='w-2 h-2 rounded-full bg-sky-500'></span>
                            <span className='text-sky-900'>Sales</span>
                        </div>
                        <div className='flex items-center gap-1.5'>
                            <span className='w-2 h-2 rounded-full bg-gray-300'></span>
                            <span className='text-gray-400'>Cost</span>
                        </div>
                    </div>
                </div>
                <div className='h-80 w-full'>
                    <Line 
                        data={chartConfig} 
                        options={{ 
                            maintainAspectRatio: false, 
                            responsive: true,
                            plugins: { legend: { display: false } },
                            scales: {
                                y: { 
                                    beginAtZero: true, 
                                    grid: { color: '#f8fafc' },
                                    ticks: { color: '#94a3b8', font: { size: 10, weight: '600' } }
                                },
                                x: { 
                                    grid: { display: false },
                                    ticks: { color: '#94a3b8', font: { size: 10, weight: '600' } }
                                }
                            }
                        }} 
                    />
                </div>
            </div>
        </div>
    )
}

export default AnalyticsPage
