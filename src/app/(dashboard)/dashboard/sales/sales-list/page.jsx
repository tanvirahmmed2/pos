'use client'
import PrintOrder from '@/components/buttons/PrintOrder'
import { generateReceipt } from '@/lib/database/print' 
import axios from 'axios'
import Link from 'next/link'
import React, { useEffect, useState, useCallback, useContext } from 'react'
import { FaBarcode } from 'react-icons/fa'
import { FaPrint, FaCheck, FaXmark } from 'react-icons/fa6'
import { GiConfirmed, GiReturnArrow } from 'react-icons/gi'
import { LuView } from 'react-icons/lu'
import { MdDelete } from 'react-icons/md'
import { toast } from 'react-hot-toast'
import { Context } from '@/components/helper/Context'

const SalesListPage = () => {
  const { siteData } = useContext(Context)
  const [orders, setOrders] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/order/search?q=${searchTerm}`, { withCredentials: true })
      setOrders(response.data.payload || [])
    } catch (error) {
      console.log(error?.response?.data?.message)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [searchTerm])

  useEffect(() => {
    const handler = setTimeout(() => fetchOrder(), 300)
    return () => clearTimeout(handler)
  }, [fetchOrder])

  const returnOrder = async (orderId) => {
    const confirm = window.confirm('Are you sure about returning this order?')
    if (!confirm) return
    try {
      const res = await axios.put('/api/order', { orderId, action: 'return' }, { withCredentials: true })
      if (res.data.success) {
        toast.success(res.data.message)
        fetchOrder()
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Return failed")
    }
  }

  const deleteOrder = async (orderId) => {
    try {
      const res = await axios.put('/api/order', { orderId, action: 'delete' }, { withCredentials: true })
      if (res.data.success) {
        toast.success("Order deleted")
        setConfirmDelete(null)
        fetchOrder()
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Delete failed")
    }
  }

  const confirmOrder = async (orderId) => {
    try {
      const res = await axios.put('/api/order', { orderId, action: 'confirm' }, { withCredentials: true })
      if (res.data.success) {
        toast.success("Order confirmed")
        fetchOrder()
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Confirmation failed")
    }
  }

  return (
    <div className='w-full max-w-7xl mx-auto p-4 md:p-6 flex flex-col gap-6 bg-slate-50 min-h-screen'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100'>
        <div>
          <h1 className='text-2xl font-bold text-slate-800 tracking-tight'>Order History</h1>
          <p className='text-sm text-slate-500 mt-1'>View and manage delivered sales orders</p>
        </div>
        <div className='w-full sm:w-80'>
          <div className='flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 focus-within:border-sky-400 focus-within:ring-4 focus-within:ring-sky-100/50 transition-all'>
            <FaBarcode className='text-slate-400 text-lg' />
            <input 
              type="text" 
              placeholder="Search orders..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}  
              className='bg-transparent border-none outline-none text-sm text-slate-700 w-full placeholder:text-slate-400'
            />
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className='w-full flex flex-col gap-4'>
        {loading ? (
           <p className='text-center text-sky-400 animate-pulse font-bold py-20'>Fetching Sales Data...</p>
        ) : orders.length === 0 ? (
          <div className='w-full h-64 flex flex-col items-center justify-center text-center gap-3 p-6 bg-white rounded-2xl shadow-sm border border-slate-100'>
             <p className='text-slate-600 font-semibold'>No Orders Found</p>
             <p className='text-slate-400 text-sm mt-1'>Try adjusting your search query.</p>
          </div>
        ) : orders.map((order) => (
          <div key={order.order_id} className='w-full grid grid-cols-1 md:grid-cols-12 gap-4 p-5 border border-slate-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow'>
            
            {/* Customer & Date Info */}
            <div className='md:col-span-3 border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:pr-4 flex flex-col justify-center'>
                <div className='flex items-center gap-2 mb-2'>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                    order.status === 'returned' ? 'bg-rose-100 text-rose-700' :
                    'bg-emerald-100 text-emerald-700'
                  }`}>
                    {order.status || 'Delivered'}
                  </span>
                  <span className='text-[10px] text-slate-400 font-bold uppercase'>
                    {(order.created_at || order.date)?.slice(0, 10)}
                  </span>
                </div>
                <p className='font-bold text-slate-800 text-lg leading-tight'>{order.name || 'Walk-in Customer'}</p>
                <p className='text-sm text-slate-500 font-medium'>{order.phone || 'No Phone'}</p>
                <p className='text-[10px] font-mono text-slate-400 mt-2'>ID: {order.order_id}</p>
            </div>

            {/* Products Info */}
            <div className='md:col-span-5 border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:px-4 flex flex-col justify-center'>
                <p className='text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest'>Order Items</p>
                <div className='flex flex-col gap-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar'>
                    {order.items?.length > 0 ? (
                        order.items.map((product, pIdx) => (
                            <div key={pIdx} className='flex justify-between items-center text-sm'>
                                <p className='font-bold text-slate-700 truncate pr-2 flex-1'>
                                  <span className='text-sky-500 font-black mr-2'>x{product.quantity}</span>
                                  {product.name}
                                </p>
                                <p className='font-black text-slate-900'>
                                  ৳{(Number(product.price) * Number(product.quantity)).toLocaleString()}
                                </p>
                            </div>
                        ))
                    ) : (
                        <p className='text-xs text-slate-400 italic'>No product data found</p>
                    )}
                </div>
            </div>

            {/* Financials Info */}
            <div className='md:col-span-3 pb-4 md:pb-0 md:px-4 flex flex-col justify-center gap-1 bg-slate-50 md:bg-transparent rounded-xl p-3 md:p-0'>
                <div className='flex justify-between text-xs text-slate-500 font-medium'>
                    <span>Gross Total</span>
                    <span>৳{order.total_amount}</span>
                </div>
                <div className='flex justify-between text-xs text-rose-500 font-medium'>
                    <span>Discount</span>
                    <span>- ৳{order.total_discount_amount || 0}</span>
                </div>
                <div className='flex justify-between items-center border-t border-slate-200 pt-2 mt-1'>
                    <span className='text-[10px] font-black text-emerald-600 uppercase tracking-wider'>Total Paid</span>
                    <span className='text-xl font-black text-emerald-600'>৳{Number(order.paid_amount || order.amount_received || 0).toLocaleString()}</span>
                </div>
            </div>

            {/* Actions */}
            <div className='md:col-span-1 flex md:flex-col items-center justify-center gap-2'>
                {confirmDelete === order.order_id ? (
                    <div className='flex flex-col gap-2 w-full animate-in fade-in zoom-in duration-200'>
                        <button
                            onClick={() => deleteOrder(order.order_id)}
                            className='w-full bg-rose-500 hover:bg-rose-600 text-white p-2.5 rounded-xl flex items-center justify-center transition-colors'
                            title="Confirm Delete"
                        >
                            <FaCheck />
                        </button>
                        <button
                            onClick={() => setConfirmDelete(null)}
                            className='w-full bg-slate-200 hover:bg-slate-300 text-slate-600 p-2.5 rounded-xl flex items-center justify-center transition-colors'
                            title="Cancel Delete"
                        >
                            <FaXmark />
                        </button>
                    </div>
                ) : (
                    <div className='w-full grid grid-cols-2 md:grid-cols-1 gap-2'>
                        <Link href={`/dashboard/sales/pos/${order.order_id}`} className='bg-sky-50 text-sky-600 hover:bg-sky-100 p-2.5 rounded-xl flex items-center justify-center transition-colors' title="View Invoice">
                          <LuView size={18} />
                        </Link>
                        <button onClick={() => generateReceipt(order, siteData)} className='bg-slate-50 text-slate-600 hover:bg-slate-100 p-2.5 rounded-xl flex items-center justify-center transition-colors' title="Print Receipt">
                          <FaPrint size={18} />
                        </button>
                        {order.status !== 'returned' && (
                          <button onClick={() => returnOrder(order.order_id)} className='bg-amber-50 text-amber-600 hover:bg-amber-100 p-2.5 rounded-xl flex items-center justify-center transition-colors' title="Return Order">
                            <GiReturnArrow size={18} />
                          </button>
                        )}
                        <button onClick={() => setConfirmDelete(order.order_id)} className='bg-rose-50 text-rose-500 hover:bg-rose-100 p-2.5 rounded-xl flex items-center justify-center transition-colors col-span-2 md:col-span-1' title="Delete Order">
                          <MdDelete size={18} />
                        </button>
                    </div>
                )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SalesListPage
