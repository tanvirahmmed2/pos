
import { BASE_URL } from '@/lib/database/secret'
import React from 'react'

const TransactionsPage = async () => {


  const res = await fetch(`${BASE_URL}/api/payment`, {
    method: 'GET',
    cache: 'no-store'
  })

  const data = await res.json()
  if (!data.success) return <p className='text-center text-gray-500 mt-10'>No history found</p>
  const transactions = data.payload

  return (
    <div className='w-full min-h-screen flex flex-col items-center p-1 sm:p-4 gap-6 '>
      <h1 className='text-center text-3xl font-bold text-gray-800 mb-4'>Transaction History</h1>
      
      <div className='w-full flex flex-col gap-1'>
        {transactions.length > 0 && transactions.map((t, idx) => (
          <div 
            key={idx} 
            className='w-full flex flex-col sm:flex-row justify-between p-4 rounded-xl border border-gray-200 shadow-md bg-white even:bg-gray-200 hover:shadow-lg transition-shadow duration-200'
          >
            <div className='flex flex-col gap-1'>
              <p className='font-medium text-gray-700'>Name: <span className='font-semibold text-gray-900'>{t.name}</span></p>
              <p className='font-medium text-gray-700'>Phone: <span className='font-semibold text-gray-900'>{t.phone}</span></p>
            </div>
            
            <div className='flex flex-col gap-1 mt-3 sm:mt-0'>
              <p className='font-medium text-gray-700'>Sub Total: <span className='font-semibold text-gray-900'>{t.subtotal}</span></p>
              <p className='font-medium text-gray-700'>Discount: <span className='font-semibold text-gray-900'>{t.discount}</span></p>
              <p className='font-medium text-gray-700'>Paid: <span className='font-semibold text-gray-900'>{t.payment_amount}</span></p>
              <p className='font-medium text-gray-700'>Date: <span className='font-semibold text-gray-900'>{t.date.slice(0, 10)}</span></p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TransactionsPage
