'use client'
import React, { useContext } from 'react'
import Orderform from '../forms/Orderform'
import { Context } from '../helper/Context'

const SalesCart = () => {
  const { cart, clearCart } = useContext(Context)

  

  return (
    <div className='w-full flex flex-col gap-6 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm'>
      <div className='flex items-center justify-between'>
        <h1 className='text-lg font-bold text-slate-800 tracking-tight'>Order Details</h1>
        <button onClick={clearCart} className='text-[10px] font-bold text-rose-500 bg-rose-50 px-3 py-1.5 rounded-lg hover:bg-rose-500 hover:text-white transition-all uppercase tracking-wider'>Clear Cart</button>
      </div>
      
      <Orderform cartItems={cart?.items} />
    </div>
  )
}

export default SalesCart
