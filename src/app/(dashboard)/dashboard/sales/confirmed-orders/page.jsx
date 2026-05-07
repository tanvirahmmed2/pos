'use client'
import React, { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { FaCheck, FaXmark } from 'react-icons/fa6'
import { MdOutlineLocalShipping, MdOutlineCancel } from 'react-icons/md'

const ConfirmedOrdersPage = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirmShip, setConfirmShip] = useState(null)
  const [confirmCancel, setConfirmCancel] = useState(null)

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      const res = await axios.get('/api/order/status?q=confirmed', { withCredentials: true })
      setOrders(res.data.success ? res.data.payload : [])
    } catch {
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const shipOrder = async (orderId) => {
    try {
      const res = await axios.put('/api/order', { orderId, action: 'ship' }, { withCredentials: true })
      if (res.data.success) {
        toast.success('Order marked as shipped')
        setConfirmShip(null)
        fetchOrders()
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Shipping failed')
    }
  }

  const cancelOrder = async (orderId) => {
    try {
      const res = await axios.put('/api/order', { orderId, action: 'cancel' }, { withCredentials: true })
      if (res.data.success) {
        toast.success('Order cancelled & stock restored')
        setConfirmCancel(null)
        fetchOrders()
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Cancel failed')
    }
  }

  return (
    <div className='w-full max-w-7xl mx-auto p-4 md:p-6 flex flex-col gap-6 bg-slate-50 min-h-screen'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100'>
        <div>
          <h1 className='text-2xl font-bold text-slate-800 tracking-tight'>Confirmed Orders</h1>
          <p className='text-sm text-slate-500 mt-1'>Ship confirmed orders or cancel if needed</p>
        </div>
        <div className='bg-sky-50 px-4 py-2 rounded-xl border border-sky-100'>
          <span className='text-sky-700 font-bold'>{orders.length}</span>
          <span className='text-sky-600 text-xs uppercase tracking-wider ml-2 font-bold'>Ready to Ship</span>
        </div>
      </div>

      {/* List */}
      <div className='w-full flex flex-col gap-4'>
        {loading ? (
          <p className='text-center text-sky-400 animate-pulse font-bold py-20'>Loading Confirmed Orders...</p>
        ) : orders.length === 0 ? (
          <div className='w-full h-64 flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border border-slate-100 shadow-sm'>
            <p className='text-slate-600 font-semibold'>No Confirmed Orders</p>
            <p className='text-slate-400 text-sm'>Confirmed orders will appear here.</p>
          </div>
        ) : orders.map((order) => (
          <div key={order.order_id} className='w-full grid grid-cols-1 md:grid-cols-12 gap-4 p-5 border border-slate-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow'>

            {/* Customer */}
            <div className='md:col-span-3 border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:pr-4 flex flex-col justify-center'>
              <div className='flex items-center gap-2 mb-2'>
                <span className='text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-sky-100 text-sky-700'>
                  Confirmed
                </span>
                <span className='text-[10px] text-slate-400 font-bold uppercase'>
                  {(order.date || order.created_at)?.slice(0, 10)}
                </span>
              </div>
              <p className='font-bold text-slate-800 text-lg leading-tight'>{order.name || 'Customer'}</p>
              <p className='text-sm text-slate-500 font-medium'>{order.phone || '—'}</p>
              <p className='text-[10px] font-mono text-slate-400 mt-2'>ID: #{order.order_id}</p>
            </div>

            {/* Items */}
            <div className='md:col-span-5 border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:px-4 flex flex-col justify-center'>
              <p className='text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest'>Order Items</p>
              <div className='flex flex-col gap-2 max-h-32 overflow-y-auto pr-2'>
                {order.product_list?.map((p, i) => (
                  <div key={i} className='flex justify-between items-center text-sm'>
                    <p className='font-bold text-slate-700 truncate pr-2 flex-1'>
                      <span className='text-sky-500 font-black mr-2'>x{p.quantity}</span>{p.name}
                    </p>
                    <p className='font-black text-slate-900'>৳{(Number(p.price) * Number(p.quantity)).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Financials */}
            <div className='md:col-span-2 md:px-4 flex flex-col justify-center gap-1'>
              <div className='flex justify-between text-xs text-slate-500'>
                <span>Total</span><span>৳{order.total_amount}</span>
              </div>
              <div className='flex justify-between text-xs text-rose-500'>
                <span>Discount</span><span>−৳{order.discount || 0}</span>
              </div>
              <div className='flex justify-between items-center border-t border-slate-200 pt-2 mt-1'>
                <span className='text-[10px] font-black text-emerald-600 uppercase'>Paid</span>
                <span className='text-lg font-black text-emerald-600'>৳{Number(order.total_amount || 0).toLocaleString()}</span>
              </div>
            </div>

            {/* Actions */}
            <div className='md:col-span-2 flex md:flex-col items-center justify-center gap-2'>
              {confirmShip === order.order_id ? (
                <div className='flex flex-col gap-2 w-full'>
                  <p className='text-[10px] text-center text-slate-500 font-bold'>Mark as shipped?</p>
                  <button onClick={() => shipOrder(order.order_id)} className='w-full bg-indigo-500 hover:bg-indigo-600 text-white p-2.5 rounded-xl flex items-center justify-center gap-1 text-xs font-bold'>
                    <FaCheck /> Confirm Ship
                  </button>
                  <button onClick={() => setConfirmShip(null)} className='w-full bg-slate-100 hover:bg-slate-200 text-slate-600 p-2.5 rounded-xl flex items-center justify-center'>
                    <FaXmark />
                  </button>
                </div>
              ) : confirmCancel === order.order_id ? (
                <div className='flex flex-col gap-2 w-full'>
                  <p className='text-[10px] text-center text-slate-500 font-bold'>Cancel & restore stock?</p>
                  <button onClick={() => cancelOrder(order.order_id)} className='w-full bg-rose-500 hover:bg-rose-600 text-white p-2.5 rounded-xl flex items-center justify-center gap-1 text-xs font-bold'>
                    <FaCheck /> Yes, Cancel
                  </button>
                  <button onClick={() => setConfirmCancel(null)} className='w-full bg-slate-100 hover:bg-slate-200 text-slate-600 p-2.5 rounded-xl flex items-center justify-center'>
                    <FaXmark />
                  </button>
                </div>
              ) : (
                <div className='w-full flex flex-col gap-2'>
                  <button onClick={() => setConfirmShip(order.order_id)} className='w-full bg-indigo-500 hover:bg-indigo-600 text-white p-2.5 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-colors'>
                    <MdOutlineLocalShipping size={18} /> Ship
                  </button>
                  <button onClick={() => setConfirmCancel(order.order_id)} className='w-full bg-rose-50 text-rose-500 hover:bg-rose-100 p-2.5 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-colors'>
                    <MdOutlineCancel size={18} /> Cancel
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

export default ConfirmedOrdersPage
