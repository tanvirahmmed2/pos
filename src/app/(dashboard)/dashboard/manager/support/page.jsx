'use client'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

const SupportPage = () => {
    const [supports, setSupports] = useState([])
    const [replyingTo, setReplyingTo] = useState(null)
    const [replyMessage, setReplyMessage] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const fetchSupport = async () => {
        try {
            const response = await axios.get('/api/support', { withCredentials: true })
            setSupports(response.data.payload || [])
        } catch (error) {
            console.log(error)
            setSupports([])
        }
    }

    useEffect(() => {
        fetchSupport()
    }, [])

    const handleReply = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            await axios.put('/api/support', {
                email: replyingTo.email,
                name: replyingTo.name,
                subject: replyingTo.subject,
                replyMessage
            }, { withCredentials: true })
            toast.success("Reply sent successfully!")
            setReplyingTo(null)
            setReplyMessage('')
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to send reply")
        } finally {
            setIsSubmitting(false)
        }
    }

    const removeSupport = async (id) => {
        if (!window.confirm("Are you sure you want to delete this message?")) return;
        try {
            const response = await axios.delete('/api/support', { data: { id }, withCredentials: true })
            toast.success(response.data.message)
            fetchSupport()
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to remove support")
        }
    }
    
    return (
        <div className='w-full max-w-7xl mx-auto flex flex-col gap-8 p-4'>
            <div className='flex flex-col gap-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-100'>
                <h1 className='text-2xl font-bold text-slate-800 tracking-tight'>Support Center</h1>
                <p className='text-sm text-slate-500'>Manage customer inquiries and respond via email</p>
            </div>

            {supports.length > 0 ? (
                <div className='grid grid-cols-1 gap-4'>
                    {supports.map((e) => (
                        <div key={e.support_id} className='bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between gap-6'>
                            <div className='flex flex-col gap-4 flex-1'>
                                <div className='flex items-center gap-3'>
                                    <div className='w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-900 font-bold'>
                                        {e.name?.[0]?.toUpperCase() || 'C'}
                                    </div>
                                    <div>
                                        <p className='font-bold text-slate-800'>{e.name}</p>
                                        <p className='text-xs text-slate-500'>{e.email}</p>
                                    </div>
                                </div>
                                <div className='bg-slate-50 p-4 rounded-xl border border-slate-100'>
                                    <p className='text-xs font-bold text-slate-400 uppercase tracking-widest mb-1'>{e.subject}</p>
                                    <p className='text-sm text-slate-700 leading-relaxed'>{e.message}</p>
                                </div>
                                <p className='text-[10px] text-slate-400 font-medium'>
                                    Received on: {new Date(e.created_at).toLocaleString()}
                                </p>
                            </div>
                            
                            <div className='flex md:flex-col items-center justify-center gap-2'>
                                <button 
                                    onClick={() => setReplyingTo(e)}
                                    className='px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold rounded-xl transition-colors w-full'
                                >
                                    Reply
                                </button>
                                <button 
                                    onClick={() => removeSupport(e.support_id)}
                                    className='px-4 py-2 bg-slate-50 text-slate-800 hover:bg-slate-800 hover:text-white text-sm font-bold rounded-xl transition-colors w-full'
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className='p-20 text-center bg-white rounded-2xl border border-dashed border-slate-200'>
                    <p className='text-slate-400 font-medium'>No support messages found.</p>
                </div>
            )}

            {/* Reply Modal */}
            {replyingTo && (
                <div className='fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4'>
                    <div className='bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200'>
                        <div className='p-6 border-b border-slate-100 flex items-center justify-between'>
                            <h2 className='text-lg font-bold text-slate-800'>Reply to {replyingTo.name}</h2>
                            <button onClick={() => setReplyingTo(null)} className='text-slate-400 hover:text-slate-600'>Close</button>
                        </div>
                        <form onSubmit={handleReply} className='p-6 flex flex-col gap-4'>
                            <div className='flex flex-col gap-1.5'>
                                <label className='text-xs font-bold text-slate-500 uppercase'>Message</label>
                                <textarea 
                                    required
                                    value={replyMessage}
                                    onChange={(e) => setReplyMessage(e.target.value)}
                                    placeholder="Write your response here..."
                                    className='w-full h-40 border border-slate-200 rounded-xl p-4 outline-none focus:border-slate-800 transition-all text-sm'
                                />
                            </div>
                            <button 
                                disabled={isSubmitting}
                                type='submit'
                                className='w-full py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl shadow-lg shadow-slate-200 transition-all disabled:opacity-50'
                            >
                                {isSubmitting ? 'Sending Email...' : 'Send Response'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default SupportPage
