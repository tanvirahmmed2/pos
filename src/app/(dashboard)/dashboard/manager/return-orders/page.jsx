'use client'
import React, { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { printOrder } from '@/lib/database/orderPrint'
import { FaPrint, FaCheck, FaXmark } from 'react-icons/fa6'
import { GiConfirmed } from 'react-icons/gi'
import { MdDelete } from 'react-icons/md'

const ReturnedOrdersPage = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      const res = await axios.get(`/api/order/status?q=returned`, { withCredentials: true })
      if (res.data.success) {
        setOrders(res.data.payload)
      } else {
        setOrders([])
      }
    } catch (error) {
      console.error("Fetch error:", error)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const confirmOrder = async (orderId) => {
    try {
      const res = await axios.put('/api/order', { orderId, action: 'confirm' }, { withCredentials: true })
      if (res.data.success) {
        toast.success("Order Confirmed")
        fetchOrders()
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Confirmation failed")
    }
  }

  const deleteOrder = async (orderId) => {
    try {
      const res = await axios.put('/api/order', { orderId, action: 'delete' }, { withCredentials: true })
      if (res.data.success) {
        toast.success("Order Deleted")
        setConfirmDelete(null)
        fetchOrders()
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Delete failed")
    }
  }

  return (
    <div className='w-full max-w-7xl mx-auto p-4 md:p-6 flex flex-col gap-6 bg-slate-50 min-h-screen'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100'>
        <div>
          <h1 className='text-2xl font-bold text-slate-800 tracking-tight'>Returned Orders</h1>
          <p className='text-sm text-slate-500 mt-1'>View orders that have been returned by customers</p>
        </div>
        <div className='bg-slate-50 px-4 py-2 rounded-xl border border-slate-100'>
          <span className='text-black font-bold'>{orders.length}</span>
          <span className='text-slate-900 text-xs uppercase tracking-wider ml-2 font-bold'>Returned</span>
        </div>
      </div>

      {/* Orders List */}
      <div className='w-full flex flex-col gap-4'>
        {loading ? (
           <p className='text-center text-slate-400 animate-pulse font-bold py-20'>Fetching Returned Orders...</p>
        ) : orders.length === 0 ? (
          <div className='w-full h-64 flex flex-col items-center justify-center text-center gap-3 p-6 bg-white rounded-2xl shadow-sm border border-slate-100'>
             <p className='text-slate-600 font-semibold'>No Returned Orders</p>
             <p className='text-slate-400 text-sm mt-1'>Everything looks good!</p>
          </div>
        ) : orders.map((order) => (
          <div key={order.order_id} className='w-full grid grid-cols-1 md:grid-cols-12 gap-4 p-5 border border-slate-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow'>
            
            {/* Customer & Date Info */}
            <div className='md:col-span-3 border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:pr-4 flex flex-col justify-center'>
                <div className='flex items-center gap-2 mb-2'>
                  <span className='text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-slate-100 text-black'>
                    Returned
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
                    {order.product_list?.length > 0 ? (
                        order.product_list.map((product, pIdx) => (
                            <div key={pIdx} className='flex justify-between items-center text-sm'>
                                <p className='font-bold text-slate-700 truncate pr-2 flex-1'>
                                  <span className='text-slate-800 font-black mr-2'>x{product.quantity}</span>
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
                <div className='flex justify-between text-xs text-slate-800 font-medium'>
                    <span>Discount</span>
                    <span>- ৳{order.discount || 0}</span>
                </div>
                <div className='flex justify-between items-center border-t border-slate-200 pt-2 mt-1'>
                    <span className='text-[10px] font-black text-slate-900 uppercase tracking-wider'>Total Refunded</span>
                    <span className='text-xl font-black text-slate-900'>৳{Number(order.paid_amount || order.amount_received || 0).toLocaleString()}</span>
                </div>
            </div>

            {/* Actions */}
            <div className='md:col-span-1 flex md:flex-col items-center justify-center gap-2'>
                {confirmDelete === order.order_id ? (
                    <div className='flex flex-col gap-2 w-full animate-in fade-in zoom-in duration-200'>
                        <button
                            onClick={() => deleteOrder(order.order_id)}
                            className='w-full bg-slate-800 hover:bg-slate-900 text-white p-2.5 rounded-xl flex items-center justify-center transition-colors'
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
                        {order.status === 'pending' && (
                          <button onClick={() => confirmOrder(order.order_id)} className='bg-slate-800 hover:bg-slate-900 text-white p-2.5 rounded-xl flex items-center justify-center transition-colors col-span-2' title="Confirm Order">
                            <GiConfirmed size={20} className="mr-2" />
                            <span className="md:hidden font-bold">Confirm</span>
                          </button>
                        )}
                        <button onClick={() => printOrder(order)} className='bg-slate-50 text-slate-600 hover:bg-slate-100 p-2.5 rounded-xl flex items-center justify-center transition-colors' title="Print Order">
                          <FaPrint size={18} />
                        </button>
                        <button onClick={() => setConfirmDelete(order.order_id)} className='bg-slate-50 text-slate-800 hover:bg-slate-100 p-2.5 rounded-xl flex items-center justify-center transition-colors' title="Delete Order">
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

export default ReturnedOrdersPage
