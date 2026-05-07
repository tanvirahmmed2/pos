'use client'
import AddBrandForm from '@/components/forms/AddBrandForm'
import AddCategoryForm from '@/components/forms/AddCategoryForm'
import AddProductForm from '@/components/forms/AddProductForm'
import { Context } from '@/components/helper/Context'
import React, { useContext } from 'react'

const NewProductPage = () => {
  const { isCategoryBox, isBrandBox } = useContext(Context)

  return (
    <div className='w-full max-w-7xl mx-auto p-4 md:p-6'>
      {/* Category Modal */}
      {isCategoryBox && (
        <div className='fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4'>
          <div className='bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200'>
            <AddCategoryForm />
          </div>
        </div>
      )}

      {/* Brand Modal */}
      {isBrandBox && (
        <div className='fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4'>
          <div className='bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200'>
            <AddBrandForm />
          </div>
        </div>
      )}

      {/* Main Form */}
      <AddProductForm />
    </div>
  )
}

export default NewProductPage
