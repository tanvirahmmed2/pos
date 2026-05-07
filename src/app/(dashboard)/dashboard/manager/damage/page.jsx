'use client'
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-hot-toast'

const DamagePage = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [products, setProducts] = useState([])
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [quantity, setQuantity] = useState(1)
    const [reason, setReason] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (searchTerm.length > 1) {
            const delay = setTimeout(async () => {
                try {
                    const res = await axios.get(`/api/product/search?q=${searchTerm}`, { withCredentials: true })
                    setProducts(res.data.payload)
                } catch (err) { setProducts([]) }
            }, 300)
            return () => clearTimeout(delay)
        } else { setProducts([]) }
    }, [searchTerm])

    const handleDamage = async () => {
        if (!selectedProduct || quantity < 1) return toast.error("Selection invalid")
        setLoading(true)
        try {
            const res = await axios.post('/api/product/damage', {
                product_id: selectedProduct.product_id,
                quantity: quantity,
                reason: reason
            }, { withCredentials: true })
            if (res.data.success) {
                toast.error(res.data.message)
                setSelectedProduct(null)
                setSearchTerm('')
                setQuantity(1)
                setReason('')
            }
        } catch (err) { 
            toast.error(err.response?.data?.message || "Stock reduction failed") 
        } finally { setLoading(false) }
    }

    return (
        <div className='max-w-6xl mx-auto w-full p-1 sm:p-4 bg-white min-h-screen'>
            {/* Header Area */}
            <div className='flex flex-col gap-1 mb-12 border-l-4 border-red-500 pl-6'>
                <h1 className='text-3xl  text-gray-900 tracking-tight uppercase'>
                    Damage & Loss Entry
                </h1>
                <p className='text-gray-400 text-xs font-bold tracking-[0.2em] uppercase'>
                    Inventory Write-off & Withdrawal
                </p>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-12 gap-12'>
                
                {/* Search Panel */}
                <div className='lg:col-span-5 flex flex-col gap-6'>
                    <div className='flex flex-col gap-2'>
                        <label className='text-[10px]  text-gray-400 uppercase tracking-widest ml-1'>
                            Find Damaged Item
                        </label>
                        <input 
                            type="text"
                            placeholder="Search by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className='w-full px-0 py-3 border-b-2 border-gray-100 bg-transparent focus:border-red-500 outline-none transition-all text-lg text-gray-800'
                        />
                    </div>
                    
                    <div className='flex flex-col gap-3 mt-4 max-h-100 overflow-y-auto custom-scrollbar'>
                        {products.map(p => (
                            <button 
                                key={p.product_id}
                                onClick={() => setSelectedProduct(p)}
                                className={`flex justify-between items-center p-5 rounded-xl border transition-all text-left ${selectedProduct?.product_id === p.product_id ? 'border-red-500 bg-red-50/30' : 'border-gray-50 hover:border-gray-200 bg-white shadow-sm'}`}
                            >
                                <div>
                                    <p className='font-bold text-gray-800'>{p.name}</p>
                                    <p className='text-[10px] text-gray-400 font-mono uppercase'>Stock: {p.stock} Units</p>
                                </div>
                                <span className='text-[10px]  text-gray-300'>#{p.product_id}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Damage Processing Panel */}
                <div className='lg:col-span-7'>
                    {selectedProduct ? (
                        <div className='bg-gray-50/50 p-10 rounded border border-gray-100 flex flex-col gap-6 sticky top-10'>
                            <div>
                                <span className='text-[10px]  text-red-600 uppercase tracking-[0.2em]'>Withdrawal Item</span>
                                <h2 className='text-2xl  text-gray-900 mt-1'>{selectedProduct.name}</h2>
                            </div>

                            <div className='grid grid-cols-2 gap-6'>
                                <div className='flex flex-col gap-2'>
                                    <label className='text-[10px] font-bold text-gray-400 uppercase tracking-widest'>Quantity</label>
                                    <input 
                                        type="number"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        className='w-full px-5 py-4 rounded-xl border-2 border-gray-100 outline-none focus:border-red-500 bg-white text-xl '
                                    />
                                </div>
                                <div className='flex flex-col gap-2'>
                                    <label className='text-[10px] font-bold text-gray-400 uppercase tracking-widest'>Financial Impact</label>
                                    <div className='px-5 py-4 rounded-xl bg-white border-2 border-gray-100'>
                                        <p className='text-xl  text-gray-400 italic'>৳{(selectedProduct.purchase_price * quantity).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                            <div className='flex flex-col gap-2'>
                                <label className='text-[10px] font-bold text-gray-400 uppercase tracking-widest'>Reason for Withdrawal</label>
                                <textarea 
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Expired, Physical Damage, Lost..."
                                    className='w-full px-5 py-4 rounded-xl border-2 border-gray-100 outline-none focus:border-red-500 bg-white min-h-25 resize-none'
                                />
                            </div>

                            <button 
                                onClick={handleDamage}
                                disabled={loading}
                                className='w-full py-5 bg-gray-900 text-white font-bold rounded-2xl hover:bg-red-600 transition-all uppercase tracking-widest shadow-xl active:scale-[0.98]'
                            >
                                {loading ? 'Updating Inventory...' : 'Confirm Stock Withdrawal'}
                            </button>
                        </div>
                    ) : (
                        <div className='h-full min-h-100 border-2 border-dashed border-gray-100 rounded flex flex-col items-center justify-center text-center p-10'>
                            <p className='text-gray-400 font-medium max-w-105'>
                                Search and select an item to record stock damage or loss.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default DamagePage
