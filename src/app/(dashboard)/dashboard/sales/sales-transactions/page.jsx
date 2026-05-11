import { BASE_URL } from '@/lib/database/secret'
import { cookies } from 'next/headers'
import React from 'react'

const TransactionsPage = async () => {
  const cookieStore = await cookies();

  try {
    const res = await fetch(`${BASE_URL}/api/payment`, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        Cookie: cookieStore.toString()
      }
    });

    const data = await res.json();
    
    if (!data.success) {
      return (
        <div className="w-full flex flex-col items-center mt-10">
          <p className='text-center text-slate-500 font-medium'>{data.message || 'No history found'}</p>
        </div>
      );
    }

    const transactions = data.payload;

    return (
      <div className='w-full min-h-screen flex flex-col items-center p-1 sm:p-4 gap-6 '>
        <h1 className='text-center text-3xl font-bold text-slate-800 mb-4'>Transaction History</h1>
        
        <div className='w-full flex flex-col gap-1'>
          {transactions.map((t, idx) => (
            <div 
              key={idx} 
              className='w-full flex flex-col sm:flex-row justify-between p-4 rounded-xl border border-slate-200 shadow-md bg-white even:bg-slate-50 hover:shadow-lg transition-shadow duration-200'
            >
              <div className='flex flex-col gap-1'>
                <p className='font-medium text-slate-700'>Name: <span className='font-semibold text-slate-900'>{t.name}</span></p>
                <p className='font-medium text-slate-700'>Phone: <span className='font-semibold text-slate-900'>{t.phone}</span></p>
                <p className='text-[10px] text-slate-400 font-mono mt-1 uppercase'>TXID: {t.transaction_id || 'N/A'}</p>
              </div>
              
              <div className='flex flex-col gap-1 mt-3 sm:mt-0 text-right'>
                <p className='text-xs text-slate-500 font-medium'>Sub Total: <span className='text-slate-700'>৳{Number(t.subtotal).toLocaleString()}</span></p>
                <p className='text-xs text-slate-500 font-medium'>Discount: <span className='text-slate-700'>- ৳{Number(t.discount).toLocaleString()}</span></p>
                <p className='text-lg font-black text-slate-900'>Paid: ৳{Number(t.payment_amount).toLocaleString()}</p>
                <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>{t.date ? new Date(t.date).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  } catch (error) {
    console.error("Transactions Page Fetch Error:", error);
    return <p className='text-center text-red-500 mt-10'>Failed to load transactions. Please try again later.</p>;
  }
}

export default TransactionsPage;
