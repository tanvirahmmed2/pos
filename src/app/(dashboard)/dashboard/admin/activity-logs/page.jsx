'use client'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { RiHistoryLine, RiRefreshLine } from 'react-icons/ri'

const ActivityLogsPage = () => {
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchLogs = async () => {
        setLoading(true)
        try {
            // Reusing inventory logs as the primary activity source for now
            const response = await axios.get('/api/report/dashboard?type=logs', { withCredentials: true })
            setLogs(response.data.payload?.logs || [])
        } catch (error) {
            console.log(error)
            setLogs([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchLogs()
    }, [])

    return (
        <div className='w-full max-w-7xl mx-auto flex flex-col gap-6'>
            <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100'>
                <div>
                    <h1 className='text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2'>
                        <RiHistoryLine className='text-sky-500' />
                        Activity Logs
                    </h1>
                    <p className='text-sm text-slate-500 mt-1'>System-wide inventory and transactional activities</p>
                </div>
                <button 
                    onClick={fetchLogs}
                    className='flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-xl font-medium transition-colors'
                >
                    <RiRefreshLine className={loading ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            <div className='bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden'>
                {loading ? (
                    <div className='p-20 text-center text-slate-400 font-medium animate-pulse'>
                        Loading activities...
                    </div>
                ) : logs.length === 0 ? (
                    <div className='p-20 text-center text-slate-400 font-medium'>
                        No activities recorded yet.
                    </div>
                ) : (
                    <div className='w-full overflow-x-auto'>
                        <table className='w-full text-left border-collapse min-w-[800px]'>
                            <thead>
                                <tr className='bg-slate-50 border-b border-slate-100'>
                                    <th className='py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider'>Time</th>
                                    <th className='py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider'>Event</th>
                                    <th className='py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider'>Product</th>
                                    <th className='py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider'>Quantity</th>
                                    <th className='py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider'>Note</th>
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-slate-100'>
                                {logs.map((log) => (
                                    <tr key={log.log_id} className='hover:bg-slate-50/50 transition-colors'>
                                        <td className='py-4 px-6 text-sm text-slate-500'>
                                            {new Date(log.created_at).toLocaleString()}
                                        </td>
                                        <td className='py-4 px-6'>
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                                                log.type === 'sale' ? 'bg-emerald-50 text-emerald-600' :
                                                log.type === 'purchase' ? 'bg-sky-50 text-sky-600' :
                                                'bg-amber-50 text-amber-600'
                                            }`}>
                                                {log.type}
                                            </span>
                                        </td>
                                        <td className='py-4 px-6 font-medium text-slate-800'>
                                            {log.product_name || `ID: ${log.product_id}`}
                                        </td>
                                        <td className='py-4 px-6 text-sm font-bold text-slate-700'>
                                            {log.quantity > 0 ? `+${log.quantity}` : log.quantity}
                                        </td>
                                        <td className='py-4 px-6 text-sm text-slate-500 max-w-xs truncate'>
                                            {log.note || '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ActivityLogsPage
