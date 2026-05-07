'use client'
import AddCutomerForm from '@/components/forms/AddCustomerForm'
import { Context } from '@/components/helper/Context'
import axios from 'axios'
import React, { useEffect, useState, useContext } from 'react'
import { RiAddLine, RiSearchLine, RiArchiveLine, RiUserSmileLine } from 'react-icons/ri'

const CustomerPage = () => {
  const [customers, setCustomers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const { isCustomerBox, setIsCustomerBox } = useContext(Context)

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const response = await axios.get(`/api/customer/search?q=${searchTerm}`, { withCredentials: true })
        setCustomers(response.data.payload)
      } catch (error) {
        setCustomers([])
      }
    }
    fetchCustomer()
  }, [searchTerm])

  return (
    <div className='w-full max-w-7xl mx-auto flex flex-col gap-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100'>
        <div>
          <h1 className='text-2xl font-bold text-slate-800 tracking-tight'>Customer Directory</h1>
          <p className='text-sm text-slate-500 mt-1'>Manage your customer intelligence and orders</p>
        </div>
        <div className='flex flex-col sm:flex-row gap-4 w-full sm:w-auto'>
          <div className='flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 focus-within:border-sky-400 focus-within:ring-4 focus-within:ring-sky-100/50 transition-all w-full sm:w-64'>
            <RiSearchLine className='text-slate-400' size={18} />
            <input 
              type="text" 
              placeholder="Search by name or phone..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}  
              className='bg-transparent border-none outline-none text-sm text-slate-700 w-full placeholder:text-slate-400'
            />
          </div>
          <button 
            onClick={() => setIsCustomerBox(true)}
            className='flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm shadow-sky-200 active:scale-95 whitespace-nowrap w-full sm:w-auto'
          >
            <RiAddLine size={20} />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      <div className='bg-transparent'>
        {customers.length === 0 ? (
          <div className='w-full h-64 flex flex-col items-center justify-center text-center gap-3 p-6 bg-white rounded-2xl shadow-sm border border-slate-100'>
            <div className='w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-400'>
              <RiUserSmileLine size={32} />
            </div>
            <div>
              <p className='text-slate-600 font-semibold'>No Customers Found</p>
              <p className='text-slate-400 text-sm mt-1'>Try adjusting your search or add a new customer.</p>
            </div>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
            {customers.map((customer) => (
              <div 
                key={customer.customer_id} 
                className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col hover:shadow-md transition-shadow group"
              >
                <div className='flex justify-between items-start mb-4'>
                  <div>
                    <h2 className='font-bold text-slate-800 group-hover:text-sky-600 transition-colors'>
                      {customer.name}
                    </h2>
                    <p className='text-xs font-mono text-slate-500 bg-slate-50 px-2 py-1 rounded-lg mt-2 inline-block'>
                      {customer.phone}
                    </p>
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 mt-auto'>
                  <div className='flex flex-col'>
                    <span className='text-[10px] uppercase text-slate-400 font-bold tracking-wider'>Orders</span>
                    <p className='text-lg font-black text-slate-700'>{customer.total_orders}</p>
                  </div>
                  <div className='flex flex-col items-end'>
                    <span className='text-[10px] uppercase text-slate-400 font-bold tracking-wider'>Value</span>
                    <p className='text-lg font-black text-emerald-600'>৳{parseFloat(customer.total_purchased_amount || 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {isCustomerBox && (
        <div className='fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4'>
          <div className='bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200'>
            <AddCutomerForm />
          </div>
        </div>
      )}
    </div>
  )
}

export default CustomerPage
