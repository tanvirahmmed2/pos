'use client'
import AddSupplierForm from '@/components/forms/AddSupplierForm'
import { Context } from '@/components/helper/Context'
import React, { useContext } from 'react'
import { RiAddLine, RiArchiveLine } from 'react-icons/ri'

const SupplierPage = () => {
  const { suppliers, isSupplierBox, setIsSupplierBox } = useContext(Context)

  return (
    <div className='w-full max-w-7xl mx-auto flex flex-col gap-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100'>
        <div>
          <h1 className='text-2xl font-bold text-slate-800 tracking-tight'>Supplier Directory</h1>
          <p className='text-sm text-slate-500 mt-1'>Overview of procurement and vendor stats</p>
        </div>
        <button 
          onClick={() => setIsSupplierBox(true)}
          className='flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm shadow-sky-200 active:scale-95 whitespace-nowrap'
        >
          <RiAddLine size={20} />
          <span>Add New Supplier</span>
        </button>
      </div>

      {/* Content */}
      <div className='bg-transparent'>
        {suppliers.length === 0 ? (
          <div className='w-full h-64 flex flex-col items-center justify-center text-center gap-3 p-6 bg-white rounded-2xl shadow-sm border border-slate-100'>
            <div className='w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-400'>
              <RiArchiveLine size={32} />
            </div>
            <div>
              <p className='text-slate-600 font-semibold'>No Suppliers Found</p>
              <p className='text-slate-400 text-sm mt-1'>Get started by adding your first supplier.</p>
            </div>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
            {suppliers.map((supplier) => {
              const totalSpent = Number(supplier.total_amount_spent || 0);
              const totalPurchases = Number(supplier.total_purchases || 0);

              return (
                <div 
                  key={supplier.supplier_id} 
                  className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col hover:shadow-md transition-shadow group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="font-bold text-slate-800 group-hover:text-sky-600 transition-colors">
                        {supplier.name}
                      </h2>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">{supplier.phone}</p>
                    </div>
                    <span className="bg-sky-50 text-sky-600 text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider">
                      Vendor
                    </span>
                  </div>
                  
                  <div className="space-y-3 pt-4 border-t border-slate-100 mt-auto">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-slate-400 uppercase">Purchases</span>
                      <span className="text-sm font-bold text-slate-700">{totalPurchases}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-slate-400 uppercase">Investment</span>
                      <span className="text-sm font-bold text-emerald-600">
                        ৳{totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    {supplier.last_purchase_date && (
                      <div className="pt-2">
                        <p className="text-[10px] text-slate-400 font-medium">
                          Last Invoice: {new Date(supplier.last_purchase_date).toLocaleDateString('en-GB')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {isSupplierBox && (
        <div className='fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4'>
          <div className='bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200'>
            <AddSupplierForm />
          </div>
        </div>
      )}
    </div>
  )
}

export default SupplierPage
